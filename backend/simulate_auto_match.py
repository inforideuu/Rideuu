import os
import django
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride
from core.tasks import dispatch_ride

# Ensure driver 49 is online, active, verified, available
driver = UserProfile.objects.get(id=49)
driver.online = True
driver.is_available = True
driver.status = 'active'
driver.kyc_status = 'VERIFIED'
driver.is_verified = True
driver.save()

customer = UserProfile.objects.get(id=8)
customer.current_latitude = 13.0827
customer.current_longitude = 80.2707
customer.save()

# Create an auto ride
ride = Ride.objects.create(
    customer=customer,
    pickup="Chennai Central",
    dropoff="Adyar",
    fare=150.0,
    distance=8.0,
    duration=20,
    status='pending',
    vehicle_type='auto'
)

print(f"Created Auto Ride #{ride.id}")
res = dispatch_ride(ride.id)
print(f"Dispatch result: {res}")

# Reload ride status
ride.refresh_from_db()
print(f"Final ride status: {ride.status}")
