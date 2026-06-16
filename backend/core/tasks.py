import logging
from celery import shared_task
from django.utils import timezone
from datetime import date
from .models import UserProfile, Vehicle, KYCDocument, Transaction

logger = logging.getLogger(__name__)

@shared_task
def audit_double_entry_ledger():
    """
    Background worker task to audit the double-entry ledger system.
    Iterates over transactions, parses the amount strings (e.g. '+₹142.00' or '-₹2,000.00'),
    and verifies that total positive balance transactions match net wallet balances
    and overall credits/debits balance across the platform.
    """
    logger.info("Starting background Double Entry Ledger Audit...")
    try:
        users = UserProfile.objects.all()
        anomalies_found = 0
        total_ledger_sum = 0.0

        for user in users:
            txs = Transaction.objects.filter(user=user)
            calculated_balance = 0.0
            for tx in txs:
                # Parse amount like "+₹142.00" or "-₹2000.00"
                amount_str = tx.amount.replace('₹', '').replace(',', '').replace(' ', '')
                try:
                    val = float(amount_str)
                    calculated_balance += val
                except ValueError:
                    logger.warning(f"Unable to parse transaction amount: {tx.amount} for user {user.id}")
                    continue

            # Compare calculated_balance against user's wallet_balance (allow small floating point discrepancy)
            if abs(calculated_balance - user.wallet_balance) > 0.05:
                logger.error(
                    f"LEDGER ANOMALY: User {user.name} (ID: {user.id}) has wallet balance ₹{user.wallet_balance} "
                    f"but transactions sum to ₹{calculated_balance:.2f}!"
                )
                anomalies_found += 1
            
            total_ledger_sum += calculated_balance

        logger.info(f"Double Entry Ledger Audit complete. Found {anomalies_found} anomalies. Total platform float: ₹{total_ledger_sum:.2f}")
        return {
            "status": "success",
            "anomalies_found": anomalies_found,
            "total_float": total_ledger_sum
        }
    except Exception as e:
        logger.exception(f"Error during Double Entry Ledger Audit: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def check_document_expiry():
    """
    Background worker task to audit all active drivers for expired documents (insurance/pollution)
    and revoke go_online capability if any document is expired.
    """
    logger.info("Starting background Document Expiry Auditing...")
    try:
        today = date.today()
        expired_count = 0
        drivers = UserProfile.objects.filter(role='driver', can_go_online=True)

        for driver in drivers:
            # Check vehicle insurance or pollution expiry
            vehicle = driver.vehicles.filter(approved=True).first()
            if vehicle:
                is_expired = False
                if vehicle.insurance_expiry and vehicle.insurance_expiry < today:
                    is_expired = True
                    logger.warning(f"Driver {driver.name} (ID: {driver.id}) has expired insurance ({vehicle.insurance_expiry})")
                if vehicle.pollution_expiry and vehicle.pollution_expiry < today:
                    is_expired = True
                    logger.warning(f"Driver {driver.name} (ID: {driver.id}) has expired pollution certificate ({vehicle.pollution_expiry})")

                if is_expired:
                    driver.can_go_online = False
                    driver.online = False
                    driver.save(update_fields=['can_go_online', 'online'])
                    expired_count += 1

        logger.info(f"Document Expiry Auditing complete. Blocked {expired_count} drivers from going online.")
        return {"status": "success", "blocked_drivers_count": expired_count}
    except Exception as e:
        logger.exception(f"Error during Document Expiry Auditing: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def check_scheduled_rides():
    """
    Checks scheduled rides and transitions them to MATCHING_PENDING if within 15 minutes.
    """
    from .models import Ride
    from django.utils import timezone
    from datetime import timedelta
    from .tasks import trigger_dispatch_ride

    now = timezone.now()
    threshold = now + timedelta(minutes=15)
    
    # Get rides scheduled within 15 minutes (or overdue)
    scheduled_rides = Ride.objects.filter(
        ride_type='SCHEDULED',
        status='SCHEDULED',
        scheduled_timestamp__lte=threshold
    )
    
    count = 0
    for ride in scheduled_rides:
        ride.status = 'MATCHING_PENDING'
        ride.save(update_fields=['status'])
        trigger_dispatch_ride(ride.id)
        count += 1
        print(f"[SCHEDULED RIDE] Ride #{ride.id} matching triggered! Time: {ride.scheduled_date} {ride.scheduled_time}", flush=True)

    return {"status": "success", "triggered_count": count}

import math
import time

def haversine_distance(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

@shared_task
def dispatch_ride(ride_id):
    """
    Sequentially dispatches the ride offer to nearby online drivers.
    If women_safety_match is active, dispatches in 3 strict fallback steps:
      Step 1: All available female drivers across all radii
      Step 2: All available women safety verified badge drivers across all radii
      Step 3: All other eligible drivers
    Within each step/phase, attempts matching within expanding search radii: 2km, 3km, 5km, 8km, 10km.
    Each driver has 15 seconds to accept or reject the offer.
    """
    from .models import Ride, UserProfile, RideDispatch, MatchingAttempt, TrackingHistory
    from .services import is_rider_eligible_for_matching

    logger.info(f"Starting dispatch pipeline for Ride #{ride_id}...")
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        logger.error(f"Ride #{ride_id} does not exist.")
        return {"status": "error", "message": "Ride not found"}

    # Track initial customer location
    customer = ride.customer
    if customer.current_latitude is not None and customer.current_longitude is not None:
        TrackingHistory.objects.create(
            ride=ride,
            latitude=customer.current_latitude,
            longitude=customer.current_longitude
        )

    radii = [2000, 3000, 5000, 8000, 10000]
    
    # Define dispatch phases based on Women Safety Mode (Flow 2)
    if getattr(ride, 'women_safety_match', False):
        phases = ['female', 'verified', 'all']
    else:
        phases = ['all']

    for phase in phases:
        for radius in radii:
            # Reload ride to check if it has been cancelled or accepted already
            ride.refresh_from_db()
            if ride.status not in ['pending', 'requested', 'MATCHING_PENDING']:
                logger.info(f"Ride #{ride_id} is no longer pending/requested/matching (current status: {ride.status}). Exiting dispatch.")
                return {"status": "success", "message": f"Ride status: {ride.status}"}

            logger.info(f"Searching for drivers in phase '{phase}' for Ride #{ride_id} in {radius}m radius...")
            
            # Get rejected drivers list
            rejected_ids = [x.strip() for x in ride.rejected_drivers.split(',') if x.strip()]

            # Query online, active, verified, available captains
            filter_kwargs = {
                'role': 'driver',
                'online': True,
                'can_go_online': True,
                'kyc_status': 'VERIFIED',
                'account_status': 'ACCOUNT_ACTIVE',
                'is_available': True
            }
            online_drivers = UserProfile.objects.filter(**filter_kwargs)

            eligible_candidates = []
            for driver in online_drivers:
                if str(driver.id) in rejected_ids:
                    continue
                if not is_rider_eligible_for_matching(driver):
                    continue
                
                # Check vehicle type matches ride requested vehicle type (Flow 1)
                r_vehicle_type = ride.vehicle_type.lower()
                if 'bike' in r_vehicle_type:
                    r_type = 'bike'
                elif 'auto' in r_vehicle_type:
                    r_type = 'auto'
                else:
                    r_type = r_vehicle_type

                has_matching_vehicle = driver.vehicles.filter(approved=True, vehicle_type__iexact=r_type).exists()
                if not has_matching_vehicle:
                    continue

                # Check if active vehicle type matches
                if driver.active_vehicle_type and driver.active_vehicle_type.lower() != r_type:
                    continue

                # Filter by phase for Women Safety (Flow 2)
                if phase == 'female':
                    if getattr(driver, 'gender', '').lower() != 'female':
                        continue
                elif phase == 'verified':
                    is_verified = getattr(driver, 'women_safety_verified', False) or getattr(driver, 'women_priority_match', False)
                    if not is_verified:
                        continue

                # Calculate distance
                dist = haversine_distance(
                    customer.current_latitude, customer.current_longitude,
                    driver.current_latitude, driver.current_longitude
                )
                if dist is None:
                    # Mock default distance if location is not set
                    dist = 300 + ((driver.id * 17 + ride.id * 31) % 2000)
                    
                if dist <= radius:
                    eligible_candidates.append((driver, dist))

            if not eligible_candidates:
                logger.info(f"No eligible drivers found in phase '{phase}' in {radius}m radius.")
                continue

            # Sort candidates by distance (nearest first)
            eligible_candidates.sort(key=lambda x: x[1])

            # Record this matching attempt
            attempt = MatchingAttempt.objects.create(ride=ride, radius=radius)
            attempt.drivers_considered.set([c[0] for c in eligible_candidates])
            
            # Sequentially offer the ride to each candidate
            for driver, dist in eligible_candidates:
                # Recheck if ride has been accepted/cancelled
                ride.refresh_from_db()
                if ride.status not in ['pending', 'requested', 'MATCHING_PENDING']:
                    logger.info(f"Ride #{ride_id} is no longer pending/requested/matching. Exiting dispatch loop.")
                    return {"status": "success", "message": f"Ride status: {ride.status}"}

                logger.info(f"Offering Ride #{ride_id} to Driver {driver.name} (ID: {driver.id}) at distance {dist:.1f}m (Phase: {phase})")
                print(f"\n[RIDE DISPATCH] Ride #{ride_id} request is now SHOWING in Rider Profile: {driver.name} (ID: {driver.id}) (Distance: {dist:.1f}m) (Phase: {phase})", flush=True)
                
                dispatch = RideDispatch.objects.create(
                    ride=ride,
                    driver=driver,
                    status='offered'
                )

                # Wait 15 seconds for driver to accept or reject
                accepted = False
                rejected = False
                for second in range(15):
                    time.sleep(1)
                    
                    # Check ride status
                    ride.refresh_from_db()
                    if ride.status == 'accepted':
                        # Driver accepted!
                        dispatch.status = 'accepted'
                        dispatch.save(update_fields=['status'])
                        accepted = True
                        print(f"[RIDE DISPATCH] Rider {driver.name} (ID: {driver.id}) ACCEPTED Ride #{ride_id}!", flush=True)
                        break
                    elif ride.status == 'cancelled':
                        dispatch.status = 'cancelled'
                        dispatch.save(update_fields=['status'])
                        print(f"[RIDE DISPATCH] Ride #{ride_id} was CANCELLED by customer.", flush=True)
                        break
                    
                    # Check if driver manually rejected the ride
                    rejected_ids = [x.strip() for x in ride.rejected_drivers.split(',') if x.strip()]
                    if str(driver.id) in rejected_ids:
                        dispatch.status = 'rejected'
                        dispatch.save(update_fields=['status'])
                        rejected = True
                        print(f"[RIDE DISPATCH] Rider {driver.name} (ID: {driver.id}) REJECTED Ride #{ride_id}!", flush=True)
                        break
                
                if accepted:
                    logger.info(f"Ride #{ride_id} successfully accepted by Driver {driver.name} (ID: {driver.id}).")
                    return {"status": "success", "driver_id": driver.id}
                
                # If not accepted, mark as timeout and add to rejected drivers list
                dispatch.refresh_from_db()
                if dispatch.status == 'offered':
                    dispatch.status = 'timeout'
                    dispatch.save(update_fields=['status'])
                    print(f"[RIDE DISPATCH] Rider {driver.name} (ID: {driver.id}) offer TIMED OUT for Ride #{ride_id}.", flush=True)
                    
                    # Add to rejected list so they aren't matched again in next cycles
                    rejected_ids = [x.strip() for x in ride.rejected_drivers.split(',') if x.strip()]
                    if str(driver.id) not in rejected_ids:
                        rejected_ids.append(str(driver.id))
                        ride.rejected_drivers = ','.join(rejected_ids)
                        ride.last_rejected_at = int(time.time())
                        ride.save(update_fields=['rejected_drivers', 'last_rejected_at'])

            logger.info(f"All drivers in phase '{phase}' in {radius}m radius rejected or timed out. Moving to next search radius.")
            
    ride.refresh_from_db()
    if ride.status in ['pending', 'requested', 'MATCHING_PENDING']:
        ride.status = 'cancelled'
        ride.save(update_fields=['status'])
        logger.info(f"Ride #{ride_id} could not be matched with any online drivers. Cancelled ride.")
        return {"status": "failed", "message": "No online drivers available"}

    return {"status": "success"}

import redis
import threading
from django.conf import settings

_redis_available_cached = None

def check_redis_available():
    global _redis_available_cached
    if _redis_available_cached is not None:
        return _redis_available_cached
    try:
        # Check if Celery/Redis broker is reachable
        r = redis.Redis.from_url(settings.CELERY_BROKER_URL, socket_timeout=0.2, socket_connect_timeout=0.2)
        r.ping()
        _redis_available_cached = True
    except Exception:
        _redis_available_cached = False
    return _redis_available_cached

def trigger_dispatch_ride(ride_id):
    if check_redis_available():
        try:
            dispatch_ride.delay(ride_id)
            return
        except Exception:
            pass
    # Fallback to background thread immediately
    t = threading.Thread(target=dispatch_ride, args=(ride_id,))
    t.daemon = True
    t.start()


