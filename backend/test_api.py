import os
import sys
import django

print("Step 1: Setting up env...")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
print("Step 2: django.setup()...")
django.setup()
print("Step 3: Importing models...")
from core.models import UserProfile, Ride
from core.views import RideViewSet
from rest_framework.test import APIRequestFactory

print("Step 4: Querying user...")
try:
    user = UserProfile.objects.get(phone='+91 1234567891')
    print("User found:", user.name, "Role:", user.role, "Online:", user.online)
    
    print("Step 5: Querying pending rides...")
    pending_rides = Ride.objects.filter(status='pending')
    print("Pending rides count in DB:", pending_rides.count())
    for r in pending_rides:
        print(f"  Ride ID: {r.id}, Customer: {r.customer.name}, Status: {r.status}")
        
    print("Step 6: Mocking request...")
    factory = APIRequestFactory()
    request = factory.get('/api/rides/pending_requests/')
    request.META['HTTP_AUTHORIZATION'] = 'Bearer jwt_mock_token_phone_38_1780652228'
    
    print("Step 7: Calling pending_requests view...")
    view = RideViewSet.as_view({'get': 'pending_requests'})
    response = view(request)
    print("API Response Status:", response.status_code)
    print("API Response Data:", response.data)
except Exception as e:
    print("Error during execution:", e)
print("Finished!")
