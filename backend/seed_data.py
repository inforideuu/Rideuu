import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import Coupon, UserProfile
from django.contrib.auth.hashers import make_password

def seed():
    print("Seeding database...")
    
    # 1. Seed Coupons
    coupons_to_create = [
        {"code": "CHENNAI50", "discount_type": "percentage", "value": 50.0, "active": True},
        {"code": "RAINY20", "discount_type": "flat", "value": 30.0, "active": True},
    ]
    for c_data in coupons_to_create:
        coupon, created = Coupon.objects.get_or_create(code=c_data["code"], defaults=c_data)
        if not created:
            coupon.discount_type = c_data["discount_type"]
            coupon.value = c_data["value"]
            coupon.active = c_data["active"]
            coupon.save()
        print(f"Coupon {coupon.code} configured.")

    # 2. Seed Test Users
    # Admin User
    admin, created = UserProfile.objects.get_or_create(
        email="admin@Rideuu.in",
        defaults={
            "phone": "+91 9999999999",
            "name": "Super Admin",
            "role": "admin",
            "status": "active",
            "password_hash": make_password("admin123"),
            "wallet_balance": 100000.0,
            "upi_id": "admin@okaxis"
        }
    )
    if not created:
        admin.role = "admin"
        admin.password_hash = make_password("admin123")
        admin.save()
    print(f"Admin user configured: admin@Rideuu.in / admin123")

    # Customer User
    customer, created = UserProfile.objects.get_or_create(
        phone="+91 9876543210",
        defaults={
            "name": "Adhithya",
            "email": "adhithya@Rideuu.in",
            "role": "customer",
            "status": "active",
            "wallet_balance": 500.0,
            "upi_id": "adhithya@okaxis",
            "bank_account": "State Bank of India ****1234"
        }
    )
    if not created:
        customer.wallet_balance = 500.0
        customer.save()
    print(f"Customer user configured: +91 9876543210")

    # Driver User
    driver, created = UserProfile.objects.get_or_create(
        phone="+91 9012345678",
        defaults={
            "name": "Raja",
            "email": "raja@Rideuu.in",
            "role": "driver",
            "status": "active",
            "wallet_balance": 3840.5,
            "upi_id": "raja@okaxis",
            "bank_account": "State Bank of India ****1234",
            "online": True
        }
    )
    if not created:
        driver.online = True
        driver.save()
    print(f"Driver user configured: +91 9012345678")

    # 3. Seed Support Tickets
    from core.models import SupportTicket
    import datetime
    
    ticket1, created1 = SupportTicket.objects.get_or_create(
        user=customer,
        subject="Driver charged extra cash",
        defaults={
            "status": "open",
            "date": str(datetime.date.today()),
            "chat": [
                {"sender": "customer", "message": "The driver asked for 50 rupees extra for fuel. Please refund.", "time": "10:30 AM"}
            ]
        }
    )
    if not created1:
        ticket1.status = "open"
        ticket1.chat = [{"sender": "customer", "message": "The driver asked for 50 rupees extra for fuel. Please refund.", "time": "10:30 AM"}]
        ticket1.save()
        
    ticket2, created2 = SupportTicket.objects.get_or_create(
        user=customer,
        subject="Late pickup and rude behavior",
        defaults={
            "status": "open",
            "date": str(datetime.date.today()),
            "chat": [
                {"sender": "customer", "message": "Driver was 20 minutes late and was extremely rude when I asked why.", "time": "11:15 AM"}
            ]
        }
    )
    if not created2:
        ticket2.status = "open"
        ticket2.chat = [{"sender": "customer", "message": "Driver was 20 minutes late and was extremely rude when I asked why.", "time": "11:15 AM"}]
        ticket2.save()
        
    print("Support tickets seeded.")

    # 4. Seed Campaigns
    from core.models import Campaign
    Campaign.objects.get_or_create(
        title="Rainy day · 10% off bike rides",
        defaults={
            "audience": "All Chennai Riders",
            "sent_count": "12,402",
            "open_rate": "38%",
            "channel": "FCM Push",
            "message": "Beat the Chennai rain. Code RAIN50 - valid today only."
        }
    )

    # 5. Seed Referral Abuse Customer
    UserProfile.objects.get_or_create(
        phone="+91 9111111111",
        defaults={
            "name": "Abuse Account",
            "role": "customer",
            "status": "active",
            "referral_abuse_flag": True
        }
    )

    # 6. Seed Ride and SOS Alert
    from core.models import Ride, SOSAlert
    ride_sos, _ = Ride.objects.get_or_create(
        customer=customer,
        driver=driver,
        pickup="Adyar",
        dropoff="Velachery",
        fare=250.0,
        distance=5.2,
        duration=15,
        status="RIDE_STARTED"
    )
    SOSAlert.objects.get_or_create(
        ride=ride_sos,
        customer=customer,
        driver=driver,
        latitude=13.0063,
        longitude=80.2520,
        status="ACTIVE",
        priority="HIGH",
        current_speed=45.0,
        direction="North"
    )
    print("Campaigns, Referral Abuse, and SOS Alert seeded.")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()

