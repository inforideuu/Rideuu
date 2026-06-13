import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import Ride
count = Ride.objects.all().count()
Ride.objects.all().delete()
print(f"Deleted {count} rides from the database successfully.")
