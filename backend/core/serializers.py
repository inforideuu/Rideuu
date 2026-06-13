from rest_framework import serializers
from .models import UserProfile, Vehicle, KYCDocument, Ride, Transaction, SupportTicket, SystemSetting, UserSession, SOSAlert, SOSLocationSnapshot, Coupon, Campaign, TrackingHistory, SurgeZoneConfig, SurgeSchedule

class TrackingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingHistory
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    vehicles = VehicleSerializer(many=True, read_only=True)
    kyc_documents = KYCDocumentSerializer(many=True, read_only=True)
    verification_progress = serializers.SerializerMethodField()
    completed_rides = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(source='online', required=False)
    women_safe = serializers.BooleanField(source='women_safety_verified', required=False)
    acceptance_rate = serializers.SerializerMethodField()
    cancel_rate = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'

    def get_verification_progress(self, obj):
        if obj.role != 'driver':
            return 100
        from .services import recalculate_driver_status
        progress, _ = recalculate_driver_status(obj)
        return progress

    def get_completed_rides(self, obj):
        if obj.role == 'driver':
            return obj.driver_rides.filter(status='completed').count()
        elif obj.role == 'customer':
            return obj.customer_rides.filter(status='completed').count()
        return 0

    def get_rating(self, obj):
        if obj.role == 'driver':
            from django.db.models import Avg
            val = obj.driver_rides.filter(status='completed', rating_driver__isnull=False).aggregate(Avg('rating_driver'))['rating_driver__avg']
            return round(val, 1) if val is not None else 0.0
        elif obj.role == 'customer':
            from django.db.models import Avg
            val = obj.customer_rides.filter(status='completed', rating_customer__isnull=False).aggregate(Avg('rating_customer'))['rating_customer__avg']
            return round(val, 1) if val is not None else 0.0
        return 0.0

    def get_acceptance_rate(self, obj):
        if obj.role != 'driver':
            return 0.0
        dispatches = obj.dispatches.all()
        total = dispatches.count()
        if total == 0:
            return 0.0
        accepted = dispatches.filter(status='accepted').count()
        return round((accepted / total) * 100, 1)

    def get_cancel_rate(self, obj):
        if obj.role != 'driver':
            return 0.0
        total_rides = obj.driver_rides.count()
        if total_rides == 0:
            return 0.0
        cancelled = obj.driver_rides.filter(status__in=['cancelled', 'CANCELLED']).count()
        return round((cancelled / total_rides) * 100, 1)

    def to_representation(self, instance):
        if instance.role == 'driver':
            from .services import recalculate_driver_status
            recalculate_driver_status(instance)
        return super().to_representation(instance)

class RideSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    driver_name = serializers.CharField(source='driver.name', default='', read_only=True)
    driver_detail = UserProfileSerializer(source='driver', read_only=True)
    tracking_history = TrackingHistorySerializer(many=True, read_only=True)
    commission = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = '__all__'

    def get_commission(self, obj):
        from .models import Transaction, SystemSetting
        # Find transaction under admin for this ride
        tx = Transaction.objects.filter(title__contains=f"Ride #{obj.id}").first()
        if tx:
            try:
                amt_str = tx.amount.replace('+₹', '').replace('-₹', '').replace('₹', '')
                return float(amt_str)
            except:
                pass
        
        auto_rate = 8.0
        bike_rate = 5.0
        try:
            settings_obj = SystemSetting.objects.filter(key='admin_general_settings').first()
            if settings_obj:
                val = settings_obj.value
                if isinstance(val, str):
                    import json
                    val = json.loads(val)
                auto_rate = float(val.get('autoCommission', auto_rate))
                bike_rate = float(val.get('bikeCommission', bike_rate))
        except:
            pass

        v_type = obj.vehicle_type.lower() if obj.vehicle_type else 'bike'
        if 'auto' in v_type:
            return round(obj.fare * (auto_rate / 100.0), 2)
        return round(obj.fare * (bike_rate / 100.0), 2)

class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    bank_account = serializers.CharField(source='user.bank_account', read_only=True)
    upi_id = serializers.CharField(source='user.upi_id', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_rating = serializers.SerializerMethodField()
    ride_id = serializers.SerializerMethodField()
    driver_rating = serializers.SerializerMethodField()
    customer_details = serializers.SerializerMethodField()
    rider_details = serializers.SerializerMethodField()
    ride_details = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = '__all__'

    def get_user_rating(self, obj):
        if obj.user.role == 'customer':
            from django.db.models import Avg
            val = obj.user.customer_rides.filter(status='completed', rating_customer__isnull=False).aggregate(Avg('rating_customer'))['rating_customer__avg']
            return round(val, 1) if val is not None else 4.8
        return 4.8

    def get_ride_id(self, obj):
        import re
        match = re.search(r'#(\d+)', obj.subject)
        if match:
            return match.group(1)
        return ""

    def get_driver_rating(self, obj):
        ride_id = self.get_ride_id(obj)
        if ride_id:
            try:
                ride = Ride.objects.get(id=int(ride_id))
                if ride.driver:
                    from django.db.models import Avg
                    val = ride.driver.driver_rides.filter(status='completed', rating_driver__isnull=False).aggregate(Avg('rating_driver'))['rating_driver__avg']
                    return round(val, 1) if val is not None else 4.5
            except:
                pass
        return 4.5

    def get_customer_details(self, obj):
        ride_id = self.get_ride_id(obj)
        if ride_id:
            try:
                ride = Ride.objects.get(id=int(ride_id))
                cust = ride.customer
                return {
                    "id": cust.id,
                    "name": cust.name,
                    "phone": cust.phone,
                    "email": cust.email or "",
                    "wallet_balance": cust.wallet_balance,
                    "rating": self.get_user_rating(obj)
                }
            except:
                pass
        if obj.user.role == 'customer':
            return {
                "id": obj.user.id,
                "name": obj.user.name,
                "phone": obj.user.phone,
                "email": obj.user.email or "",
                "wallet_balance": obj.user.wallet_balance,
                "rating": self.get_user_rating(obj)
            }
        return None

    def get_rider_details(self, obj):
        ride_id = self.get_ride_id(obj)
        if ride_id:
            try:
                ride = Ride.objects.get(id=int(ride_id))
                driver = ride.driver
                if driver:
                    vehicle = driver.vehicles.first()
                    return {
                        "id": driver.id,
                        "name": driver.name,
                        "phone": driver.phone,
                        "email": driver.email or "",
                        "wallet_balance": driver.wallet_balance,
                        "rating": self.get_driver_rating(obj),
                        "vehicle_type": vehicle.vehicle_type if vehicle else "bike",
                        "plate_number": vehicle.plate_number if vehicle else ""
                    }
            except:
                pass
        if obj.user.role == 'driver':
            vehicle = obj.user.vehicles.first()
            return {
                "id": obj.user.id,
                "name": obj.user.name,
                "phone": obj.user.phone,
                "email": obj.user.email or "",
                "wallet_balance": obj.user.wallet_balance,
                "rating": self.get_driver_rating(obj),
                "vehicle_type": vehicle.vehicle_type if vehicle else "bike",
                "plate_number": vehicle.plate_number if vehicle else ""
            }
        return None

    def get_ride_details(self, obj):
        ride_id = self.get_ride_id(obj)
        if ride_id:
            try:
                ride = Ride.objects.get(id=int(ride_id))
                return {
                    "id": ride.id,
                    "pickup": ride.pickup,
                    "dropoff": ride.dropoff,
                    "fare": ride.fare,
                    "distance": ride.distance,
                    "duration": ride.duration,
                    "status": ride.status,
                    "payment_mode": ride.payment_mode
                }
            except:
                pass
        return None

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'

class SOSLocationSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSLocationSnapshot
        fields = '__all__'

class SOSAlertSerializer(serializers.ModelSerializer):
    snapshots = SOSLocationSnapshotSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    driver_name = serializers.CharField(source='driver.name', read_only=True, default='')

    class Meta:
        model = SOSAlert
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'


class SurgeZoneConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgeZoneConfig
        fields = '__all__'


class SurgeScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgeSchedule
        fields = '__all__'


