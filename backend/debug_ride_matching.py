import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride

print("--- RECENT RIDES ---")
rides = Ride.objects.order_by('-id')[:5]
for r in rides:
    print(f"Ride {r.id}: status={r.status}, type={r.vehicle_type}, requested_at={r.created_at}")

print("\n--- ONLINE DRIVERS ---")
drivers = UserProfile.objects.filter(role='driver', online=True)
for d in drivers:
    vehicle = d.vehicles.filter(approved=True).first()
    v_type = vehicle.vehicle_type if vehicle else 'No Approved Vehicle'
    print(f"Driver {d.id} ({d.name}): kyc={d.kyc_status}, active={d.status}, can_go_online={d.can_go_online}, vehicle={v_type}")
    print(f"   docs:")
    for doc in d.kyc_documents.all():
        print(f"      {doc.document_type}: {doc.status}")
