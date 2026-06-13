import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from core.models import UserProfile, Ride
from core.views import RideViewSet
from rest_framework.test import APIRequestFactory

u = UserProfile.objects.filter(phone__contains='1234567891').first()
customer = UserProfile.objects.filter(role='customer').first()

if u and customer:
    ride = Ride.objects.create(
        customer=customer,
        pickup='In-Process Test',
        pickup_sub='Chennai',
        dropoff='In-Process Test',
        dropoff_sub='Chennai',
        fare=100.0,
        distance=5.0,
        duration=10,
        status='pending',
        otp='9999'
    )
    print(f"Created pending ride ID: {ride.id}")

    factory = APIRequestFactory()
    request = factory.patch(f'/api/rides/{ride.id}/', {'status': 'accepted', 'driver': u.id}, format='json')
    request.META['HTTP_AUTHORIZATION'] = 'Bearer jwt_mock_token_phone_38_1780652228'

    view = RideViewSet.as_view({'patch': 'partial_update'})
    try:
        response = view(request, pk=ride.id)
        print("API Response Status:", response.status_code)
        print("API Response Data:", response.data)
    except Exception as e:
        print("Exception occurred:", e)
else:
    print("Could not find user or customer.")
