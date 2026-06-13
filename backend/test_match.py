import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride

if __name__ == '__main__':
    try:
        d = UserProfile.objects.get(id=49)
        print(f"Driver {d.name} (id={d.id}): lat={d.current_latitude}, lon={d.current_longitude}")
    except UserProfile.DoesNotExist:
        print("Driver 49 does not exist.")
    
    r = Ride.objects.all().order_by('-id').first()
    if r:
        print(f"Ride #{r.id}: customer={r.customer.name} (id={r.customer.id}), status={r.status}, vehicle_type={r.vehicle_type}")
        print(f"   customer lat={r.customer.current_latitude}, lon={r.customer.current_longitude}")
