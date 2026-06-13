import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride, Vehicle

print("--- ONLINE DRIVERS ---")
online_drivers = UserProfile.objects.filter(online=True)
for d in online_drivers:
    print(f"Driver {d.id} ({d.name}): phone={d.phone}, online={d.online}, is_available={d.is_available}, role={d.role}")
    for v in d.vehicles.all():
        print(f"   Vehicle: type={v.vehicle_type}, model={v.model}, approved={v.approved}")

print("\n--- LATEST RIDES ---")
rides = Ride.objects.all().order_by('-id')[:5]
for r in rides:
    print(f"Ride #{r.id}: customer={r.customer.name}, status={r.status}, vehicle_type={r.vehicle_type}, fare={r.fare}")
