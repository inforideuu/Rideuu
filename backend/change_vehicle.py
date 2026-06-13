import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride

d = UserProfile.objects.filter(role='driver', online=True).first()
if d:
    v = d.vehicles.filter(approved=True).first()
    if v:
        print(f"Current vehicle type: {v.vehicle_type}")
        v.vehicle_type = 'bike'
        v.save()
        print("Changed vehicle type to bike.")
