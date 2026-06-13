import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile

deleted = UserProfile.objects.filter(role='driver').delete()
print(f"Deletion result: {deleted}")
