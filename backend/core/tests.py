from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, timedelta
from core.models import UserProfile, Vehicle, KYCDocument, Ride, OTPVerification, UserSession
from core.services import recalculate_driver_status, is_rider_eligible_for_matching

class RiderOnboardingTests(APITestCase):
    def setUp(self):
        # Clean up database
        UserProfile.objects.all().delete()
        Vehicle.objects.all().delete()
        KYCDocument.objects.all().delete()
        OTPVerification.objects.all().delete()
        
    def test_rider_registration_and_otp_login(self):
        # 1. Send OTP
        send_otp_url = reverse('send-otp')
        response = self.client.post(send_otp_url, {'email': 'raja.kumar@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        otp_code = response.data['otp']
        
        # 2. Verify OTP (Registration / Login)
        verify_otp_url = reverse('verify-otp')
        response = self.client.post(verify_otp_url, {
            'email': 'raja.kumar@example.com',
            'otp': otp_code,
            'role': 'driver',
            'name': 'Raja Kumar',
            'phone': '9876543210'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
        # Verify user is created
        user = UserProfile.objects.get(email='raja.kumar@example.com')
        self.assertEqual(user.name, 'Raja Kumar')
        self.assertEqual(user.role, 'driver')
        self.assertEqual(user.kyc_status, 'NOT_STARTED')
        self.assertEqual(user.account_status, 'PROFILE_INCOMPLETE')
        
    def test_verification_progress_and_kyc_transitions(self):
        # Create a driver
        driver = UserProfile.objects.create(
            phone='+91 9876543210',
            name='Raja Kumar',
            role='driver',
            status='new'
        )
        
        # Recalculate - should be 0% progress and NOT_STARTED status (no profile photo, name is set but kycList has no profile_photo)
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 0)
        self.assertEqual(kyc_status, 'NOT_STARTED')
        
        # Add profile photo kyc doc -> progress should become 10% (profile complete)
        photo_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='profile_photo',
            status='progress',
            file_data='profile.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 10)
        self.assertEqual(kyc_status, 'IN_PROGRESS')
        
        # Upload Aadhaar (15%) -> progress should become 25%
        aadhaar_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='aadhaar',
            status='progress',
            file_data='aadhaar.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 25)
        self.assertEqual(kyc_status, 'IN_PROGRESS')
        
        # Upload Driving License (15%) -> progress should become 40%
        license_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='license',
            status='progress',
            file_data='license.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 40)
        
        # Add vehicle (15%) -> progress should become 55%
        vehicle = Vehicle.objects.create(
            driver=driver,
            model='Bajaj RE Auto',
            plate_number='TN 22 BZ 4421',
            vehicle_type='auto',
            approved=False,
            insurance_expiry=date.today() + timedelta(days=100),
            pollution_expiry=date.today() + timedelta(days=100)
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 55)
        
        # Upload RC Book (15%) -> progress should become 70%
        rc_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='vehicle',
            status='progress',
            file_data='rc.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 70)
        
        # Upload Insurance (15%) -> progress should become 85%
        insurance_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='insurance',
            status='progress',
            file_data='insurance.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 85)
        
        # Upload Selfie (15%) -> progress should become 100%
        selfie_doc = KYCDocument.objects.create(
            driver=driver,
            document_type='selfie',
            status='progress',
            file_data='selfie.jpg'
        )
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(progress, 100)
        
        # All uploads completed, but vehicle and documents not yet approved -> status: UNDER_REVIEW
        self.assertEqual(kyc_status, 'UNDER_REVIEW')
        
        # Reopen screen / fetch serializer checks
        serializer_data = self.client.get(reverse('user-detail', args=[driver.id]), HTTP_AUTHORIZATION=f"Bearer token_{driver.id}").data
        # Wait, since serializer uses get_user_from_token, let's create a token session
        session = UserSession.objects.create(
            user=driver,
            device='test',
            ip_address='127.0.0.1',
            token=f'test_token_{driver.id}',
            is_current=True
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer test_token_{driver.id}')
        response = self.client.get(reverse('user-detail', args=[driver.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['verification_progress'], 100)
        self.assertEqual(response.data['kyc_status'], 'UNDER_REVIEW')
        
        # Admin approval: Approve all documents and vehicle
        photo_doc.status = 'done'
        photo_doc.save()
        aadhaar_doc.status = 'done'
        aadhaar_doc.save()
        license_doc.status = 'done'
        license_doc.save()
        rc_doc.status = 'done'
        rc_doc.save()
        insurance_doc.status = 'done'
        insurance_doc.save()
        selfie_doc.status = 'done'
        selfie_doc.save()
        
        vehicle.approved = True
        vehicle.save()
        
        # Recalculate
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(kyc_status, 'VERIFIED')
        self.assertEqual(driver.status, 'active') # auto activated
        self.assertEqual(driver.account_status, 'ACCOUNT_ACTIVE')
        
        # Rejection transition: Reject one document
        aadhaar_doc.status = 'rejected'
        aadhaar_doc.rejection_reason = 'Blurry document'
        aadhaar_doc.save()
        
        progress, kyc_status = recalculate_driver_status(driver)
        self.assertEqual(kyc_status, 'REJECTED')
        self.assertEqual(driver.account_status, 'REJECTED')
        
    def test_go_online_and_matching_restrictions(self):
        driver = UserProfile.objects.create(
            phone='+91 9876543211',
            name='Raja Online',
            role='driver',
            status='active'
        )
        
        # Set credentials
        session = UserSession.objects.create(
            user=driver,
            device='test',
            ip_address='127.0.0.1',
            token=f'test_token_{driver.id}',
            is_current=True
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer test_token_{driver.id}')
        
        # Create vehicle
        vehicle = Vehicle.objects.create(
            driver=driver,
            model='Bajaj RE Auto',
            plate_number='TN 22 BZ 4422',
            vehicle_type='auto',
            approved=False
        )
        
        # 1. Attempt to go online before kyc - should fail
        response = self.client.patch(reverse('user-detail', args=[driver.id]), {'online': True})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 2. Add and approve all documents & vehicle
        docs = ['profile_photo', 'aadhaar', 'license', 'vehicle', 'insurance', 'selfie']
        for doc_type in docs:
            KYCDocument.objects.create(
                driver=driver,
                document_type=doc_type,
                status='done',
                file_data=f'{doc_type}.jpg'
            )
        vehicle.approved = True
        vehicle.save()
        
        # Recalculate
        recalculate_driver_status(driver)
        self.assertTrue(driver.can_go_online)
        self.assertTrue(is_rider_eligible_for_matching(driver))
        
        # Attempt to go online now - should succeed
        response = self.client.patch(reverse('user-detail', args=[driver.id]), {'online': True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['online'])
        
        # 3. Matching eligibility restrictions:
        # Suspended driver should be rejected
        driver.status = 'suspended'
        driver.save()
        recalculate_driver_status(driver)
        self.assertFalse(is_rider_eligible_for_matching(driver))
        
        # Reactivate, but expire insurance
        driver.status = 'active'
        driver.save()
        vehicle.insurance_expiry = date.today() - timedelta(days=1)
        vehicle.save()
        recalculate_driver_status(driver)
        self.assertFalse(is_rider_eligible_for_matching(driver))
