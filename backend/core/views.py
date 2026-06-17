from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
import time
import logging

logger = logging.getLogger(__name__)

from .models import UserProfile, Vehicle, KYCDocument, Ride, Transaction, SupportTicket, SystemSetting, UserSession, SOSAlert, SOSLocationSnapshot, Coupon, Campaign, SurgeZoneConfig, SurgeSchedule
from .serializers import (
    UserProfileSerializer, VehicleSerializer, KYCDocumentSerializer,
    RideSerializer, TransactionSerializer, SupportTicketSerializer, SystemSettingSerializer, UserSessionSerializer,
    SOSAlertSerializer, SOSLocationSnapshotSerializer, CouponSerializer, CampaignSerializer,
    SurgeZoneConfigSerializer, SurgeScheduleSerializer
)


def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header:
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
        else:
            token = auth_header
    else:
        token = request.query_params.get('token')
        
    if not token:
        return None
        
    try:
        session = UserSession.objects.filter(token=token).first()
        if session:
            session.save() # touches last_active
            return session.user
            
        parts = token.split('_')
        for i, p in enumerate(parts):
            if p in ('phone', 'email', 'google', 'apple', 'pass') and i + 1 < len(parts):
                user_id = int(parts[i+1])
                try:
                    return UserProfile.objects.get(id=user_id)
                except UserProfile.DoesNotExist:
                    first_user = UserProfile.objects.first()
                    if first_user:
                        return first_user
    except Exception as e:
        print(f"[get_user_from_token Error] {e}", flush=True)
    return None

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied

class AdminRolePermission(BasePermission):
    def has_permission(self, request, view):
        user = get_user_from_token(request)
        if not user:
            return False
            
        if user.role != 'admin':
            return True
            
        sub_role = getattr(user, 'sub_role', '')
        if not sub_role or sub_role == 'admin':
            sub_role = 'super_admin'
            
        view_name = view.__class__.__name__
        
        # Operational Manager Restrictions
        if sub_role == 'operations':
            if view_name in ['TransactionViewSet', 'SystemSettingViewSet']:
                raise PermissionDenied("Operational Managers are unauthorized to access financial tables or system settings.")
                
        # Financial Controller Restrictions
        elif sub_role == 'finance':
            if view_name in ['KYCDocumentViewSet', 'VehicleViewSet', 'SystemSettingViewSet']:
                raise PermissionDenied("Financial Controllers are unauthorized to access KYC documents, vehicles, or system settings.")
                
        # Support Lead Restrictions
        elif sub_role == 'support':
            if view_name in ['TransactionViewSet', 'SystemSettingViewSet']:
                raise PermissionDenied("Support Leads are unauthorized to access ledger, withdrawals, or system settings.")
                
        # Admin Profile management
        if view_name == 'UserProfileViewSet' and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            target_role = request.data.get('role')
            # If creating or modifying an admin role, only super_admin can do it
            if (target_role == 'admin' or (view.kwargs.get('pk') and UserProfile.objects.filter(id=view.kwargs.get('pk'), role='admin').exists())) and sub_role != 'super_admin':
                raise PermissionDenied("Only Super Admins can manage administrator profiles or roles.")
                
        return True

def get_session_info(request):
    ua = request.META.get('HTTP_USER_AGENT', 'Unknown Browser')
    ip = request.META.get('HTTP_X_FORWARDED_FOR')
    if ip:
        ip = ip.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    
    device = "Chrome on Windows"
    ua_lower = ua.lower()
    if 'android' in ua_lower:
        device = "Android Device"
    elif 'iphone' in ua_lower:
        device = "iPhone"
    elif 'ipad' in ua_lower:
        device = "iPad"
    elif 'macintosh' in ua_lower or 'mac os' in ua_lower:
        if 'safari' in ua_lower and 'chrome' not in ua_lower:
            device = "Safari on macOS"
        else:
            device = "Chrome on macOS"
    elif 'linux' in ua_lower:
        device = "Linux Device"
    elif 'windows' in ua_lower:
        if 'edge' in ua_lower:
            device = "Edge on Windows"
        elif 'chrome' in ua_lower:
            device = "Chrome on Windows"
        elif 'firefox' in ua_lower:
            device = "Firefox on Windows"
        else:
            device = "Windows Device"
            
    import random
    locations = ["Adyar, Chennai", "Besant Nagar, Chennai", "Nungambakkam, Chennai", "T. Nagar, Chennai", "Velachery, Chennai"]
    loc = random.choice(locations)
    return device, ip, loc

def create_user_session(user, token, request):
    device, ip, loc = get_session_info(request)
    UserSession.objects.filter(token=token).delete()
    session = UserSession.objects.create(
        user=user,
        device=device,
        ip_address=ip,
        location=loc,
        token=token,
        is_current=True
    )
    UserSession.objects.filter(user=user).exclude(id=session.id).update(is_current=False)
    return session

class UserProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_permissions(self):
        if self.action in ('by_phone', 'by_email'):
            return []
        return super().get_permissions()

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return UserProfile.objects.none()
        if user.role == 'admin':
            return UserProfile.objects.all()
        if user.role == 'customer':
            return UserProfile.objects.filter(models.Q(id=user.id) | models.Q(role='driver'))
        return UserProfile.objects.filter(id=user.id)

    def perform_update(self, serializer):
        password = self.request.data.get('password')
        if password:
            from django.contrib.auth.hashers import make_password
            serializer.validated_data['password_hash'] = make_password(password)
            
        online_val = self.request.data.get('online')
        if online_val is None:
            online_val = self.request.data.get('is_online')
            
        is_online_true = (
            online_val is True or 
            online_val == 1 or 
            (isinstance(online_val, str) and online_val.strip().lower() in ('true', '1'))
        )
        is_online_false = (
            online_val is False or 
            online_val == 0 or 
            (isinstance(online_val, str) and online_val.strip().lower() in ('false', '0'))
        )
            
        if is_online_true:
            profile = self.get_object()
            if profile.role == 'driver':
                from .services import recalculate_driver_status
                recalculate_driver_status(profile)
                if not profile.can_go_online:
                    from rest_framework.serializers import ValidationError
                    raise ValidationError({'detail': 'Rider is not eligible to go online. Complete KYC and approve vehicle first.', 'reason': 'Documents under review or not approved.'})
            
            serializer.validated_data['online'] = True
            serializer.validated_data['last_location_update'] = int(time.time())
            serializer.validated_data['is_available'] = True
        elif is_online_false:
            serializer.validated_data['online'] = False
            serializer.validated_data['is_available'] = False
            
        serializer.save()
        profile = self.get_object()
        if profile.role == 'driver':
            from .services import recalculate_driver_status
            recalculate_driver_status(profile)
            
            # Record coordinates if currently on an active trip/ride simulation
            if profile.current_latitude is not None and profile.current_longitude is not None:
                from .models import Ride, TrackingHistory
                active_ride = Ride.objects.filter(
                    driver=profile,
                    status__in=['accepted', 'RIDER_ASSIGNED', 'DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'otp', 'trip', 'RIDE_STARTED']
                ).first()
                if active_ride:
                    last_pt = TrackingHistory.objects.filter(ride=active_ride).order_by('-timestamp').first()
                    if not last_pt or abs(last_pt.latitude - profile.current_latitude) > 0.00001 or abs(last_pt.longitude - profile.current_longitude) > 0.00001:
                        TrackingHistory.objects.create(
                            ride=active_ride,
                            latitude=profile.current_latitude,
                            longitude=profile.current_longitude
                        )

    @action(detail=True, methods=['get'])
    def activation_status(self, request, pk=None):
        profile = self.get_object()
        from .services import recalculate_driver_status
        progress, kyc_status = recalculate_driver_status(profile)
        
        aadhaar_v = profile.kyc_documents.filter(document_type='aadhaar', status='done').exists()
        license_v = profile.kyc_documents.filter(document_type='license', status='done').exists()
        vehicle_v = profile.kyc_documents.filter(document_type='vehicle', status='done').exists()
        insurance_v = profile.kyc_documents.filter(document_type='insurance', status='done').exists()
        profile_photo_v = profile.kyc_documents.filter(document_type='profile_photo', status='done').exists()
        selfie_v = profile.kyc_documents.filter(document_type='selfie', status='done').exists()
        
        vehicle_approved = profile.vehicles.filter(approved=True).exists()
        can_go = profile.can_go_online
        
        return Response({
            "profile_completed": bool(profile.name and profile.phone and profile_photo_v),
            "aadhaar_verified": aadhaar_v,
            "license_verified": license_v,
            "vehicle_verified": vehicle_approved,
            "insurance_verified": insurance_v,
            "profile_photo_verified": profile_photo_v,
            "selfie_verified": selfie_v,
            "kyc_verified": kyc_status == 'VERIFIED',
            "can_go_online": can_go,
            "verification_progress": progress
        })

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        drivers = UserProfile.objects.filter(role='driver')
        serializer = self.get_serializer(drivers, many=True)
        data = sorted(serializer.data, key=lambda x: x.get('completed_rides', 0), reverse=True)[:10]
        return Response(data)

    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        user = get_user_from_token(request)
        if not user or user.role not in ['driver', 'customer']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        amount = request.data.get('amount')
        fee = request.data.get('fee', 0)
        wallet_type = request.data.get('wallet_type', 'wallet')
        
        try:
            amount = float(amount)
            fee = float(fee)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount or fee'}, status=status.HTTP_400_BAD_REQUEST)
            
        total_deduction = amount + fee
        
        # Check balance based on wallet type
        if wallet_type == 'incentive':
            current_balance = user.incentive_balance
        elif wallet_type == 'bonus':
            current_balance = user.bonus_balance
        else:
            current_balance = user.wallet_balance
            
        if current_balance < total_deduction:
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Deduct from selected wallet
        if wallet_type == 'incentive':
            user.incentive_balance = round(user.incentive_balance - total_deduction, 2)
            user.save(update_fields=['incentive_balance'])
            title_text = "Withdraw to HDFC (Incentive Wallet)"
        elif wallet_type == 'bonus':
            user.bonus_balance = round(user.bonus_balance - total_deduction, 2)
            user.save(update_fields=['bonus_balance'])
            title_text = "Withdraw to HDFC (Bonus Wallet)"
        else:
            user.wallet_balance = round(user.wallet_balance - total_deduction, 2)
            user.save(update_fields=['wallet_balance'])
            title_text = "Withdraw to HDFC"
            
        from .models import Transaction
        from datetime import date
        Transaction.objects.create(
            user=user,
            title=title_text,
            amount=f"-₹{amount:.2f}",
            date=str(date.today()),
            positive=False,
            status='pending'
        )
        
        if fee > 0:
            Transaction.objects.create(
                user=user,
                title="Admin Fee (Withdrawal)",
                amount=f"-₹{fee:.2f}",
                date=str(date.today()),
                positive=False
            )
            
            # Admin fees always credit to the admin's main cash wallet
            admin_user = UserProfile.objects.filter(role='admin').first()
            if admin_user:
                admin_user.wallet_balance = round(admin_user.wallet_balance + fee, 2)
                admin_user.save(update_fields=['wallet_balance'])
                Transaction.objects.create(
                    user=admin_user,
                    title=f"Withdrawal Fee Earned (Driver {user.name})",
                    amount=f"+₹{fee:.2f}",
                    date=str(date.today()),
                    positive=True
                )
                
        return Response({
            'success': True,
            'wallet_balance': user.wallet_balance,
            'incentive_balance': user.incentive_balance,
            'bonus_balance': user.bonus_balance
        })

    @action(detail=False, methods=['get'])
    def by_phone(self, request):
        phone = request.query_params.get('phone')
        role = request.query_params.get('role', 'customer')
        name = request.query_params.get('name', 'Anonymous User')
        if not phone:
            return Response({'error': 'phone is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        phone_clean = phone.strip().replace(" ", "")
        if phone_clean.startswith("+91"):
            phone_clean = phone_clean[3:]
        phone_normalized = "+91 " + phone_clean

        user, created = UserProfile.objects.get_or_create(
            phone=phone_normalized,
            defaults={
                'name': name if name and name != 'Anonymous User' else 'Anonymous User',
                'role': role,
                'status': 'active' if role == 'customer' else 'new',
                'wallet_balance': 0.0,
                'incentive_balance': 0.0,
                'bonus_balance': 0.0,
                'upi_id': f"{name.lower().replace(' ', '.')}@okaxis" if name else "user@okaxis",
                'bank_account': "State Bank of India ****1234"
            }
        )
        
        # Ensure role is set to driver if requesting as driver
        if role == 'driver' and user.role != 'driver':
            user.role = 'driver'
            user.save(update_fields=['role'])

        # Ensure name/gender are preserved and not overridden by defaults
        if not created:
            if name and name != 'Anonymous User' and (not user.name or user.name == 'Anonymous User'):
                user.name = name
                user.save(update_fields=['name'])

        # Ensure vehicle exists for new drivers
        if role == 'driver':
            if created or not user.vehicles.exists():
                vehicle_type = request.query_params.get('vehicle_type')
                if vehicle_type:
                    if 'bike' in vehicle_type.lower():
                        vehicle_type = 'bike'
                    else:
                        vehicle_type = 'auto'
                    
                    user.active_vehicle_type = vehicle_type
                    user.save(update_fields=['active_vehicle_type'])

                    if not user.vehicles.filter(vehicle_type=vehicle_type).exists():
                        Vehicle.objects.create(
                            driver=user,
                            model='Honda Activa' if vehicle_type == 'bike' else 'Bajaj RE Auto',
                            plate_number='TN 22 BZ 4421',
                            vehicle_type=vehicle_type,
                            approved=True,
                            insurance_expiry='2027-03-15',
                            pollution_expiry='2026-11-20',
                            maintenance_days=14
                        )
                else:
                    Vehicle.objects.create(
                        driver=user,
                        model='Bajaj RE Auto',
                        plate_number='TN 22 BZ 4421',
                        vehicle_type='auto',
                        approved=True,
                        insurance_expiry='2027-03-15',
                        pollution_expiry='2026-11-20',
                        maintenance_days=14
                    )
            elif request.query_params.get('vehicle_type') and not user.active_vehicle_type:
                v_type = request.query_params.get('vehicle_type')
                if 'bike' in v_type.lower():
                    user.active_vehicle_type = 'bike'
                else:
                    user.active_vehicle_type = 'auto'
                user.save(update_fields=['active_vehicle_type'])
            
        # Generate referral code if empty
        if not user.referral_code:
            user.referral_code = f"NAMMA{user.id}"
            user.save(update_fields=['referral_code'])

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_email(self, request):
        email = request.query_params.get('email')
        role = request.query_params.get('role', 'customer')
        name = request.query_params.get('name', 'Anonymous User')
        phone = request.query_params.get('phone', '')
        if not email:
            return Response({'error': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        email_normalized = email.strip().lower()

        user, created = UserProfile.objects.get_or_create(
            email=email_normalized,
            defaults={
                'phone': "+91 " + phone.strip().replace(" ", "") if phone else "+91 " + str(random.randint(9000000000, 9999999999)),
                'name': name if name and name != 'Anonymous User' else 'Anonymous User',
                'role': role,
                'status': 'active' if role == 'customer' else 'new',
                'wallet_balance': 0.0,
                'incentive_balance': 0.0,
                'bonus_balance': 0.0,
                'upi_id': f"{name.lower().replace(' ', '.')}@okaxis" if name else "user@okaxis",
                'bank_account': "State Bank of India ****1234"
            }
        )
        
        # Ensure role is set to driver if requesting as driver
        if role == 'driver' and user.role != 'driver':
            user.role = 'driver'
            user.save(update_fields=['role'])

        # Ensure name/gender/phone are preserved
        if not created:
            if name and name != 'Anonymous User' and (not user.name or user.name == 'Anonymous User'):
                user.name = name
                user.save(update_fields=['name'])
            if phone and (not user.phone or user.phone.startswith("+91 99999") or user.phone.startswith("+91 90000")):
                user.phone = "+91 " + phone.strip().replace(" ", "")
                user.save(update_fields=['phone'])

        # Ensure vehicle exists for new drivers
        if role == 'driver':
            if created or not user.vehicles.exists():
                vehicle_type = request.query_params.get('vehicle_type')
                if vehicle_type:
                    if 'bike' in vehicle_type.lower():
                        vehicle_type = 'bike'
                    else:
                        vehicle_type = 'auto'
                    
                    user.active_vehicle_type = vehicle_type
                    user.save(update_fields=['active_vehicle_type'])

                    if not user.vehicles.filter(vehicle_type=vehicle_type).exists():
                        Vehicle.objects.create(
                            driver=user,
                            model='Honda Activa' if vehicle_type == 'bike' else 'Bajaj RE Auto',
                            plate_number='TN 22 BZ 4421',
                            vehicle_type=vehicle_type,
                            approved=True,
                            insurance_expiry='2027-03-15',
                            pollution_expiry='2026-11-20',
                            maintenance_days=14
                        )
                else:
                    Vehicle.objects.create(
                        driver=user,
                        model='Bajaj RE Auto',
                        plate_number='TN 22 BZ 4421',
                        vehicle_type='auto',
                        approved=True,
                        insurance_expiry='2027-03-15',
                        pollution_expiry='2026-11-20',
                        maintenance_days=14
                    )
            elif request.query_params.get('vehicle_type') and not user.active_vehicle_type:
                v_type = request.query_params.get('vehicle_type')
                if 'bike' in v_type.lower():
                    user.active_vehicle_type = 'bike'
                else:
                    user.active_vehicle_type = 'auto'
                user.save(update_fields=['active_vehicle_type'])
            
        # Generate referral code if empty
        if not user.referral_code:
            user.referral_code = f"NAMMA{user.id}"
            user.save(update_fields=['referral_code'])

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def claim_referral(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Referral code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        code_clean = code.strip().upper()
        # Find referrer
        referrer = UserProfile.objects.filter(referral_code=code_clean).first()
        if not referrer:
            return Response({'error': 'Invalid referral code'}, status=status.HTTP_400_BAD_REQUEST)
        
        if referrer.id == user.id:
            return Response({'error': 'You cannot refer yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already claimed a code
        from .models import Transaction
        from datetime import date
        already_claimed = Transaction.objects.filter(user=user, title__contains="Referral Code Claimed").exists()
        if already_claimed:
            return Response({'error': 'You have already claimed a referral code'}, status=status.HTTP_400_BAD_REQUEST)

        # Credit referrer
        referrer.bonus_balance = round(referrer.bonus_balance + 300.0, 2)
        referrer.save(update_fields=['bonus_balance'])
        
        # Credit user
        user.bonus_balance = round(user.bonus_balance + 300.0, 2)
        user.save(update_fields=['bonus_balance'])
        
        # Create transactions
        Transaction.objects.create(
            user=referrer,
            title=f"Referral Bonus (Driver {user.phone})",
            amount="+₹300.00",
            positive=True,
            date=str(date.today())
        )
        Transaction.objects.create(
            user=user,
            title=f"Referral Code Claimed ({referrer.referral_code})",
            amount="+₹300.00",
            positive=True,
            date=str(date.today())
        )
        
        # Log support tickets as notifications
        from .models import SupportTicket
        SupportTicket.objects.create(
            user=referrer,
            subject="Referral Reward Credited",
            status="resolved",
            date=str(date.today()),
            chat=[{
                "sender": "support",
                "message": f"Driver {user.name} ({user.phone}) joined using your code. ₹300 bonus credited.",
                "time": str(date.today())
            }]
        )
        
        return Response({
            'success': True,
            'bonus_balance': user.bonus_balance,
            'referrer_name': referrer.name
        })

    @action(detail=False, methods=['get'])
    def referrals(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Ensure referral_code is set
        if not user.referral_code:
            user.referral_code = f"NAMMA{user.id}"
            user.save(update_fields=['referral_code'])

        # Get referred users by parsing transactions
        from .models import Transaction
        txs = Transaction.objects.filter(user=user, title__contains="Referral Bonus")
        referred_phones = []
        for tx in txs:
            import re
            m = re.search(r'\+91\s?\d+', tx.title)
            if m:
                referred_phones.append(m.group(0))
            else:
                m2 = re.search(r'Driver\s?([\d\s+]+)', tx.title)
                if m2:
                    referred_phones.append(m2.group(1).strip())
                    
        return Response({
            'referral_code': user.referral_code,
            'referred_drivers': referred_phones,
            'earnings': len(referred_phones) * 300
        })

class VehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class KYCDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = KYCDocument.objects.all()
    serializer_class = KYCDocumentSerializer

    def perform_create(self, serializer):
        doc = serializer.save()
        self._ensure_file_exists(doc)

    def perform_update(self, serializer):
        doc = serializer.save()
        self._ensure_file_exists(doc)

    def _ensure_file_exists(self, doc):
        import os
        from django.conf import settings
        from django.core.files.base import ContentFile
        
        # Check if actual file was uploaded
        if not doc.file and doc.file_data:
            # If the user passed base64, keep it in file_data and don't overwrite it
            if doc.file_data.startswith("data:"):
                # Avoid saving content file that overrides file_data if it's already base64 data url
                return
            # Simulated upload: create a mock file in media storage
            os.makedirs(os.path.join(settings.MEDIA_ROOT, 'kyc_documents'), exist_ok=True)
            file_name = doc.file_data
            content = f"Mock file content for {doc.document_type} of rider {doc.driver.name}"
            doc.file.save(file_name, ContentFile(content), save=True)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        doc = self.get_object()
        doc.status = request.data.get('status', doc.status)
        doc.rejection_reason = request.data.get('rejection_reason', doc.rejection_reason)
        doc.save()
        return Response(self.get_serializer(doc).data)

class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all().order_by('-created_at')
    serializer_class = RideSerializer

    def create(self, request, *args, **kwargs):
        # 1. Check if booking pipeline is halted (Halt Booking Pipeline)
        try:
            emergency_setting = SystemSetting.objects.get(key='emergency_settings')
            emerg_val = emergency_setting.value
            if isinstance(emerg_val, str):
                import json
                emerg_val = json.loads(emerg_val)
            if emerg_val.get('pauseBookings') is True or str(emerg_val.get('pauseBookings')).lower() == 'true':
                return Response({
                    'error': 'Chennai Booking Pipeline Halted: Bookings are temporarily paused due to severe weather emergency.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            pass

        # 2. Proceed with ride creation
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            # Check if Women-Safe Priority is active
            try:
                emergency_setting = SystemSetting.objects.get(key='emergency_settings')
                emerg_val = emergency_setting.value
                if isinstance(emerg_val, str):
                    import json
                    emerg_val = json.loads(emerg_val)
                if emerg_val.get('forceWomenSafe') is True or str(emerg_val.get('forceWomenSafe')).lower() == 'true':
                    ride_id = response.data.get('id')
                    ride = Ride.objects.get(id=ride_id)
                    if ride.customer and ride.customer.gender == 'female':
                        ride.women_safety_match = True
                        ride.save(update_fields=['women_safety_match'])
                        response.data['women_safety_match'] = True
                        print(f"[EMERGENCY OVERRIDE] Women-Safe Priority active. Forced women safety match for ride #{ride_id}.", flush=True)
            except Exception as e:
                pass
        return response

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return Ride.objects.none()
        if user.role == 'admin':
            return Ride.objects.all().order_by('-created_at')
        if user.role == 'driver':
            return Ride.objects.filter(models.Q(customer=user) | models.Q(driver=user) | models.Q(status__in=['pending', 'MATCHING_PENDING'])).order_by('-created_at')
        return Ride.objects.filter(models.Q(customer=user) | models.Q(driver=user)).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def pending_requests(self, request):
        user = get_user_from_token(request)
        if not user or user.role != 'driver':
            return Response([])
            
        from .services import is_rider_eligible_for_matching
        if not is_rider_eligible_for_matching(user):
            return Response([])

        # Synchronously trigger scheduled ride check for robustness
        from .tasks import check_scheduled_rides
        try:
            check_scheduled_rides()
        except Exception as e:
            logger.warning(f"Error checking scheduled rides synchronously: {e}")

        current_time = int(time.time())
        # Automatically mark drivers whose location updates stopped > 30 seconds ago as offline and unavailable
        from .models import UserProfile
        stale_drivers = UserProfile.objects.filter(role='driver', online=True, last_location_update__gt=0, last_location_update__lt=current_time - 30)
        for sd in stale_drivers:
            sd.online = False
            sd.is_available = False
            sd.save(update_fields=['online', 'is_available'])

        # Ensure dispatch pipeline is triggered for all pending rides
        from .models import Ride, RideDispatch
        from .tasks import trigger_dispatch_ride

        pending_rides = Ride.objects.filter(models.Q(status='pending') | models.Q(status='MATCHING_PENDING'))
        for ride in pending_rides:
            # If no dispatch records exist for this ride, trigger the matching task
            if not RideDispatch.objects.filter(ride=ride).exists():
                trigger_dispatch_ride(ride.id)

        # Return rides that are currently offered to this driver
        offered_dispatches = RideDispatch.objects.filter(driver=user, status='offered', ride__status__in=['pending', 'MATCHING_PENDING'])
        matched_rides = [d.ride for d in offered_dispatches]
        
        serializer = self.get_serializer(matched_rides, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject_ride(self, request, pk=None):
        ride = self.get_object()
        driver = get_user_from_token(request)
        if not driver or driver.role != 'driver':
            return Response({'error': 'Only drivers can reject rides.'}, status=status.HTTP_400_BAD_REQUEST)
            
        rejected = [x.strip() for x in ride.rejected_drivers.split(',') if x.strip()]
        driver_id_str = str(driver.id)
        if driver_id_str not in rejected:
            rejected.append(driver_id_str)
        ride.rejected_drivers = ','.join(rejected)
        ride.last_rejected_at = int(time.time())
        ride.save(update_fields=['rejected_drivers', 'last_rejected_at'])
        
        return Response({'success': True, 'rejected_drivers': ride.rejected_drivers})

    def process_ride_settlement(self, ride):
        from datetime import date
        from .models import UserProfile, Transaction, SupportTicket
        from .services import recalculate_driver_status

        if not ride.driver:
            return

        driver = ride.driver
        # Fetch vehicle type
        v_type = ride.vehicle_type.lower() if ride.vehicle_type else 'bike'
        
        import time
        has_no_commission = getattr(driver, 'no_commission_expiry', 0) > int(time.time())

        if has_no_commission:
            commission_percent = 0.0
            commission_label = "No Commission (Flat ₹3)"
            commission_amount = 3.0
        else:
            # Load configured commission rates dynamically
            auto_rate = 8.0
            bike_rate = 5.0
            try:
                settings_obj = SystemSetting.objects.filter(key='admin_general_settings').first()
                if settings_obj:
                    val = settings_obj.value
                    if isinstance(val, str):
                        import json
                        val = json.loads(val)
                    auto_rate = float(val.get('autoCommission', auto_rate))
                    bike_rate = float(val.get('bikeCommission', bike_rate))
            except Exception as e:
                print(f"[SETTLEMENT WARNING] Error loading general settings: {e}", flush=True)

            if 'auto' in v_type:
                commission_percent = auto_rate / 100.0
                commission_label = f"{int(auto_rate)}%" if auto_rate.is_integer() else f"{auto_rate}%"
            else:
                commission_percent = bike_rate / 100.0
                commission_label = f"{int(bike_rate)}%" if bike_rate.is_integer() else f"{bike_rate}%"
            commission_amount = round(ride.fare * commission_percent, 2)

        fare_amount = ride.fare
        driver_earnings = round(fare_amount - commission_amount, 2)

        # Get Admin User
        admin_user = UserProfile.objects.filter(role='admin').first()

        payment_mode = ride.payment_mode.lower() if ride.payment_mode else 'cash'

        if payment_mode == 'cash':
            # Driver collects full cash, owes admin commission
            driver.wallet_balance = round(driver.wallet_balance - commission_amount, 2)
            driver.save(update_fields=['wallet_balance'])

            # Log Transaction for driver
            Transaction.objects.create(
                user=driver,
                title=f"Commission Deduction (Cash Ride #{ride.id})",
                amount=f"-₹{commission_amount:.2f}",
                positive=False,
                date=str(date.today())
            )

            # Log notification SupportTicket for driver
            SupportTicket.objects.create(
                user=driver,
                subject=f"Ride Payment Notification - Ride #{ride.id}",
                status="resolved",
                date=str(date.today()),
                chat=[{
                    "sender": "support",
                    "message": f"Ride #{ride.id} completed. You collected ₹{fare_amount:.2f} in cash. Platform commission of {commission_label} (₹{commission_amount:.2f}) was deducted from your wallet.",
                    "time": str(date.today())
                }]
            )

            if admin_user:
                previous_balance = admin_user.wallet_balance
                admin_user.wallet_balance = round(admin_user.wallet_balance + commission_amount, 2)
                admin_user.save(update_fields=['wallet_balance'])

                # Log Transaction for admin
                Transaction.objects.create(
                    user=admin_user,
                    title=f"Commission Earned (Ride #{ride.id})",
                    amount=f"+₹{commission_amount:.2f}",
                    positive=True,
                    date=str(date.today())
                )

                # Log notification SupportTicket for admin
                SupportTicket.objects.create(
                    user=admin_user,
                    subject=f"Commission Received - Ride #{ride.id}",
                    status="resolved",
                    date=str(date.today()),
                    chat=[{
                        "sender": "support",
                        "message": f"Ride #{ride.id} ({v_type}) completed. Received commission: {commission_label}. Commission amount: ₹{commission_amount:.2f}. Previous admin wallet balance: ₹{previous_balance:.2f}. Updated admin wallet balance: ₹{admin_user.wallet_balance:.2f}.",
                        "time": str(date.today())
                    }]
                )
        else:
            # Online payment (Razorpay, Wallet, Card)
            driver.wallet_balance = round(driver.wallet_balance + driver_earnings, 2)
            driver.save(update_fields=['wallet_balance'])

            # Log Transaction for driver
            Transaction.objects.create(
                user=driver,
                title=f"Earnings Credited (Online Ride #{ride.id})",
                amount=f"+₹{driver_earnings:.2f}",
                positive=True,
                date=str(date.today())
            )

            # Log notification SupportTicket for driver
            SupportTicket.objects.create(
                user=driver,
                subject=f"Ride Payment Notification - Ride #{ride.id}",
                status="resolved",
                date=str(date.today()),
                chat=[{
                    "sender": "support",
                    "message": f"Ride #{ride.id} completed. Your earnings of ₹{driver_earnings:.2f} (Fare: ₹{fare_amount:.2f} minus {commission_label} commission of ₹{commission_amount:.2f}) were credited to your wallet.",
                    "time": str(date.today())
                }]
            )

            if admin_user:
                previous_balance = admin_user.wallet_balance
                admin_user.wallet_balance = round(admin_user.wallet_balance + commission_amount, 2)
                admin_user.save(update_fields=['wallet_balance'])

                # Log Transaction for admin
                Transaction.objects.create(
                    user=admin_user,
                    title=f"Commission Earned (Ride #{ride.id})",
                    amount=f"+₹{commission_amount:.2f}",
                    positive=True,
                    date=str(date.today())
                )

                # Log notification SupportTicket for admin
                SupportTicket.objects.create(
                    user=admin_user,
                    subject=f"Commission Received - Ride #{ride.id}",
                    status="resolved",
                    date=str(date.today()),
                    chat=[{
                        "sender": "support",
                        "message": f"Ride #{ride.id} ({v_type}) completed online. Received commission: {commission_label}. Commission amount: ₹{commission_amount:.2f}. Previous admin wallet balance: ₹{previous_balance:.2f}. Updated admin wallet balance: ₹{admin_user.wallet_balance:.2f}.",
                        "time": str(date.today())
                    }]
                )

        # Trigger negative balance checks & status updates
        recalculate_driver_status(driver)

    def perform_create(self, serializer):
        ride_type = self.request.data.get('ride_type', 'NORMAL')
        status = 'pending'
        scheduled_date = self.request.data.get('scheduled_date')
        scheduled_time = self.request.data.get('scheduled_time')
        
        scheduled_timestamp = None
        if ride_type == 'SCHEDULED' or scheduled_date:
            ride_type = 'SCHEDULED'
            status = 'SCHEDULED'
            if scheduled_date and scheduled_time:
                try:
                    import dateutil.parser
                    from django.utils import timezone
                    dt_str = f"{scheduled_date} {scheduled_time}"
                    dt_parsed = dateutil.parser.parse(dt_str)
                    scheduled_timestamp = timezone.make_aware(dt_parsed)
                except Exception as e:
                    logger.warning(f"Error parsing scheduled datetime: {e}")
                    pass
        
        pickup = self.request.data.get('pickup')
        dropoff = self.request.data.get('dropoff')
        fare = self.request.data.get('fare', 0.0)

        serializer.save(
            ride_type=ride_type,
            status=status,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            scheduled_timestamp=scheduled_timestamp,
            pickup_location=pickup,
            drop_location=dropoff,
            estimated_fare=fare
        )

    def perform_update(self, serializer):
        driver_id = self.request.data.get('driver')
        status_val = self.request.data.get('status')
        if driver_id and status_val in ['accepted', 'RIDER_ASSIGNED']:
            # Race condition check: make sure the ride is still pending or matching!
            ride = self.get_object()
            if ride.status not in ['pending', 'MATCHING_PENDING']:
                from rest_framework import serializers as drf_serializers
                raise drf_serializers.ValidationError('Ride has already been accepted by another driver.')
            
            driver = UserProfile.objects.filter(id=driver_id).first()
            if driver:
                from .services import is_rider_eligible_for_matching
                if not is_rider_eligible_for_matching(driver):
                    from rest_framework import serializers as drf_serializers
                    raise drf_serializers.ValidationError('Driver is not eligible for matching (unverified, pending/rejected/expired documents, or suspended).')
                
                # Mark driver as unavailable (on trip)
                driver.is_available = False
                driver.save(update_fields=['is_available'])
                
                # Map accepted state to RIDER_ASSIGNED
                self.request.data['status'] = 'RIDER_ASSIGNED'

        old_status = self.get_object().status
        ride = serializer.save()
        new_status = ride.status
        if old_status not in ['completed', 'COMPLETED'] and new_status in ['completed', 'COMPLETED']:
            self.process_ride_settlement(ride)

        # Cancellation fine logic for scheduled rides cancelled less than 1 hour before departure
        if old_status not in ['cancelled', 'CANCELLED'] and new_status in ['cancelled', 'CANCELLED'] and ride.ride_type == 'SCHEDULED':
            from django.utils import timezone
            from datetime import timedelta
            now = timezone.now()
            if ride.scheduled_timestamp and (ride.scheduled_timestamp - now) < timedelta(hours=1):
                cancel_fee = 10.0
                try:
                    settings_obj = SystemSetting.objects.filter(key='admin_general_settings').first()
                    if settings_obj:
                        val = settings_obj.value
                        if isinstance(val, str):
                            import json
                            val = json.loads(val)
                        cancel_fee = float(val.get('riderCancelFee', 10.0))
                except Exception as e:
                    logger.warning(f"Error loading riderCancelFee: {e}")

                customer = ride.customer
                customer.wallet_balance = round(customer.wallet_balance - cancel_fee, 2)
                customer.save(update_fields=['wallet_balance'])

                from .models import Transaction
                from datetime import date
                Transaction.objects.create(
                    user=customer,
                    title=f"Cancellation Fine (Scheduled Ride #{ride.id} cancelled within 1 hr)",
                    amount=f"-₹{cancel_fee:.2f}",
                    positive=False,
                    date=str(date.today()),
                    status='paid'
                )

                admin_user = UserProfile.objects.filter(role='admin').first()
                if admin_user:
                    admin_user.wallet_balance = round(admin_user.wallet_balance + cancel_fee, 2)
                    admin_user.save(update_fields=['wallet_balance'])
                    Transaction.objects.create(
                        user=admin_user,
                        title=f"Scheduled Cancellation Fine Earned (Ride #{ride.id})",
                        amount=f"+₹{cancel_fee:.2f}",
                        positive=True,
                        date=str(date.today()),
                        status='paid'
                    )

        # Record tracking point on state/step change
        if ride.driver and ride.driver.current_latitude is not None and ride.driver.current_longitude is not None:
            from .models import TrackingHistory
            last_pt = TrackingHistory.objects.filter(ride=ride).order_by('-timestamp').first()
            if not last_pt or abs(last_pt.latitude - ride.driver.current_latitude) > 0.00001 or abs(last_pt.longitude - ride.driver.current_longitude) > 0.00001:
                TrackingHistory.objects.create(
                    ride=ride,
                    latitude=ride.driver.current_latitude,
                    longitude=ride.driver.current_longitude
                )

    @action(detail=False, methods=['get'])
    def active_ride(self, request):
        phone = request.query_params.get('phone')
        role = request.query_params.get('role')
        if not phone:
            return Response({'error': 'phone is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        phone_clean = phone.strip().replace(" ", "")
        if phone_clean.startswith("+91"):
            phone_clean = phone_clean[3:]
        phone_normalized = "+91 " + phone_clean

        try:
            # Synchronously trigger scheduled ride check here too
            from .tasks import check_scheduled_rides
            try:
                check_scheduled_rides()
            except Exception as e:
                logger.warning(f"Error checking scheduled rides synchronously: {e}")

            user = UserProfile.objects.get(phone=phone_normalized)
            if role == 'driver':
                ride = Ride.objects.filter(driver=user).exclude(status__in=['completed', 'cancelled', 'COMPLETED', 'CANCELLED']).first()
            else:
                ride = Ride.objects.filter(customer=user).exclude(status__in=['completed', 'cancelled', 'SCHEDULED', 'MATCHING_PENDING', 'COMPLETED', 'CANCELLED']).first()
            
            if ride:
                return Response(self.get_serializer(ride).data)
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        except UserProfile.DoesNotExist:
            return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = Transaction.objects.all().order_by('-timestamp')
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return Transaction.objects.none()
        if user.role == 'admin':
            return Transaction.objects.all().order_by('-timestamp')
        return Transaction.objects.filter(user=user).order_by('-timestamp')

    @action(detail=False, methods=['get'])
    def user_transactions(self, request):
        phone = request.query_params.get('phone')
        user = get_user_from_token(request)
        if user and user.role != 'admin':
            txs = Transaction.objects.filter(user=user).order_by('-id')
        elif phone:
            phone_clean = phone.strip().replace(" ", "")
            if phone_clean.startswith("+91"):
                phone_clean = phone_clean[3:]
            phone_normalized = "+91 " + phone_clean
            txs = Transaction.objects.filter(user__phone=phone_normalized).order_by('-id')
        else:
            txs = Transaction.objects.none()
        serializer = self.get_serializer(txs, many=True)
        return Response(serializer.data)

class SupportTicketViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return SupportTicket.objects.none()
        if user.role == 'admin':
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def user_tickets(self, request):
        phone = request.query_params.get('phone')
        user = get_user_from_token(request)
        if user and user.role != 'admin':
            tickets = SupportTicket.objects.filter(user=user)
        elif phone:
            phone_clean = phone.strip().replace(" ", "")
            if phone_clean.startswith("+91"):
                phone_clean = phone_clean[3:]
            phone_normalized = "+91 " + phone_clean
            tickets = SupportTicket.objects.filter(user__phone=phone_normalized)
        else:
            tickets = SupportTicket.objects.none()
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        ticket = self.get_object()
        amount_val = request.data.get('amount')
        try:
            amount = float(amount_val)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        import re
        from datetime import date
        from .models import Ride, Transaction
        
        ride_id = None
        match = re.search(r'#(\d+)', ticket.subject)
        if match:
            ride_id = int(match.group(1))
            
        ride = None
        if ride_id:
            try:
                ride = Ride.objects.get(id=ride_id)
            except Ride.DoesNotExist:
                pass
                
        if not ride:
            return Response({'error': 'No active ride associated with this ticket found for refund.'}, status=status.HTTP_400_BAD_REQUEST)
            
        rider = ride.driver
        customer = ride.customer
        
        if not rider:
            return Response({'error': 'No rider assigned to this ride.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Deduct from rider
        rider.wallet_balance = round(rider.wallet_balance - amount, 2)
        rider.save(update_fields=['wallet_balance'])
        
        # Credit to customer
        customer.wallet_balance = round(customer.wallet_balance + amount, 2)
        customer.save(update_fields=['wallet_balance'])
        
        # Create transactions
        Transaction.objects.create(
            user=rider,
            title=f"Refund Debit (Ride #{ride.id})",
            amount=f"-₹{amount:.2f}",
            positive=False,
            date=str(date.today())
        )
        Transaction.objects.create(
            user=customer,
            title=f"Refund Credit (Ride #{ride.id})",
            amount=f"+₹{amount:.2f}",
            positive=True,
            date=str(date.today())
        )
        
        # Create notification for rider
        SupportTicket.objects.create(
            user=rider,
            subject=f"Wallet Refund Debit - Ride #{ride.id}",
            status="resolved",
            date=str(date.today()),
            chat=[{
                "sender": "support",
                "message": f"An amount of ₹{amount:.2f} was deducted from your wallet due to a refund issued for Ride #{ride.id}.",
                "time": str(date.today())
            }]
        )
        
        # Mark original ticket as resolved
        ticket.status = 'resolved'
        ticket.save(update_fields=['status'])
        
        return Response(self.get_serializer(ticket).data)

class CouponViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = Coupon.objects.all().order_by('-id')
    serializer_class = CouponSerializer

class CampaignViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = Campaign.objects.all().order_by('-id')
    serializer_class = CampaignSerializer

class UserSessionViewSet(viewsets.ModelViewSet):
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return UserSession.objects.none()
        
        auth_header = self.request.headers.get('Authorization')
        token = None
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
            else:
                token = auth_header
        else:
            token = self.request.query_params.get('token')
            
        sessions = UserSession.objects.filter(user=user).order_by('-last_active')
        for s in sessions:
            s.is_current = (s.token == token)
            s.save()
        return sessions

    @action(detail=False, methods=['post'])
    def revoke_all_except_current(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        auth_header = request.headers.get('Authorization')
        token = None
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
            else:
                token = auth_header
        else:
            token = request.query_params.get('token')
            
        UserSession.objects.filter(user=user).exclude(token=token).delete()
        return Response({'success': True})

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            session = UserSession.objects.get(id=pk, user=user)
            session.delete()
            return Response({'success': True})
        except UserSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class SystemSettingViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminRolePermission]
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    lookup_field = 'key'

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return []
        return super().get_permissions()

    def retrieve(self, request, key=None):
        try:
            setting = SystemSetting.objects.get(key=key)
            return Response(setting.value)
        except SystemSetting.DoesNotExist:
            default_values = {
                'surge_multiplier': 1.2,
                'rain_active': False,
                'flood_alert': False,
                'low_network': False,
                'rain_mode': False,
                'festival_mode': False,
                'hotspot_mode': False,
                'flood_mode': False,
                'surge_cap': True,
                'geofence_zones': [
                    {'id': 'zone-1', 'name': 'Adyar Zone', 'surge': 1.0, 'active': True, 'count': 140, 'polygon': [[13.0063, 80.2520], [13.0013, 80.2570], [13.0113, 80.2620]]},
                    {'id': 'zone-2', 'name': 'Velachery Hub', 'surge': 1.8, 'active': True, 'count': 420, 'polygon': [[12.9815, 80.2185], [12.9765, 80.2235], [12.9865, 80.2285]]},
                    {'id': 'zone-3', 'name': 'Anna Nagar West', 'surge': 1.5, 'active': True, 'count': 230, 'polygon': [[13.0850, 80.2100], [13.0800, 80.2150], [13.0900, 80.2200]]}
                ],
                'admin_geofence_settings': [
                    {'id': 'zone-1', 'name': 'Adyar Zone', 'surge': 1.0, 'active': True, 'count': 140, 'polygon': [[13.0063, 80.2520], [13.0013, 80.2570], [13.0113, 80.2620]]},
                    {'id': 'zone-2', 'name': 'Velachery Hub', 'surge': 1.8, 'active': True, 'count': 420, 'polygon': [[12.9815, 80.2185], [12.9765, 80.2235], [12.9865, 80.2285]]},
                    {'id': 'zone-3', 'name': 'Anna Nagar West', 'surge': 1.5, 'active': True, 'count': 230, 'polygon': [[13.0850, 80.2100], [13.0800, 80.2150], [13.0900, 80.2200]]}
                ],
                'no_commission_plans': [
                    { "price": 19, "days": 1, "label": "24 Hours", "desc": "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "auto" },
                    { "price": 49, "days": 3, "label": "3 Days", "desc": "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "auto" },
                    { "price": 99, "days": 7, "label": "7 Days", "desc": "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "auto" },
                    { "price": 499, "days": 30, "label": "1 Month", "desc": "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "auto" },
                    { "price": 15, "days": 1, "label": "24 Hours", "desc": "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "bike" },
                    { "price": 45, "days": 3, "label": "3 Days", "desc": "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "bike" },
                    { "price": 95, "days": 7, "label": "7 Days", "desc": "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "bike" },
                    { "price": 495, "days": 30, "label": "1 Month", "desc": "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", "vehicle_type": "bike" }
                ],
                'subscription_passes': [
                    { "id": "p1", "name": "Marina Beach Auto Pass", "desc": "5 auto rides up to 5km within Mylapore/Adyar", "price": 299, "valid": "30 days" },
                    { "id": "p2", "name": "Chennai Central Commuter", "desc": "Flat 20% off all bike rides from central railway hubs", "price": 99, "valid": "15 days" }
                ],
                'admin_general_settings': {
                    "bikeBase": "25",
                    "bikePerKm": "6",
                    "autoBase": "40",
                    "autoPerKm": "14",
                    "waitingRate": "2",
                    "commissionRate": "15",
                    "gstRate": "5",
                    "riderCancelFee": "10",
                    "driverCancelFee": "15",
                    "referralLimit": "100"
                },
                'emergency_settings': {
                    "floodMode": False,
                    "pauseBookings": False,
                    "forceWomenSafe": False,
                    "disableSurgeCap": False
                }
            }
            if key in default_values:
                return Response(default_values[key])
            return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def set_val(self, request):
        key = request.data.get('key')
        val = request.data.get('value')
        if not key:
            return Response({'error': 'key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        setting, _ = SystemSetting.objects.get_or_create(key=key, defaults={'value': val})
        setting.value = val
        setting.save()

        # Print SMS alert / override logs when emergency settings are changed
        if key == 'emergency_settings':
            try:
                emerg_val = val
                if isinstance(emerg_val, str):
                    emerg_val = json.loads(emerg_val)
                if isinstance(emerg_val, dict):
                    if emerg_val.get('floodMode') is True or str(emerg_val.get('floodMode')).lower() == 'true':
                        print("\n[FLOOD OVERRIDE SYSTEM ACTIVE] Instantly capped max surge rate to 1.0x. Routing SMS alerts to all active Chennai drivers and dispatch units...", flush=True)
                    if emerg_val.get('pauseBookings') is True or str(emerg_val.get('pauseBookings')).lower() == 'true':
                        print("\n[HALT BOOKING PIPELINE ACTIVE] Chennai Geofence booking pipeline has been halted! Dispatch blocked.", flush=True)
                    if emerg_val.get('forceWomenSafe') is True or str(emerg_val.get('forceWomenSafe')).lower() == 'true':
                        print("\n[WOMEN-SAFE PRIORITY ACTIVE] Forced matching system for female passengers is now active.", flush=True)
            except Exception as e:
                print(f"Error printing emergency status log: {e}", flush=True)

        return Response(setting.value)


class SurgeZoneConfigViewSet(viewsets.ModelViewSet):
    queryset = SurgeZoneConfig.objects.all().order_by('-id')
    serializer_class = SurgeZoneConfigSerializer
    permission_classes = []


class SurgeScheduleViewSet(viewsets.ModelViewSet):
    queryset = SurgeSchedule.objects.all().order_by('-id')
    serializer_class = SurgeScheduleSerializer
    permission_classes = []


import urllib.request
import urllib.parse
import json
import time
import redis
from rest_framework.views import APIView
from .models import Coupon

try:
    try:
        redis_client = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=0.5, protocol=2)
        redis_client.ping()
    except TypeError:
        redis_client = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=0.5)
        redis_client.ping()
    redis_available = True
    print("[REDIS INITIALIZATION] Connected to Redis server successfully.", flush=True)
except Exception as e:
    redis_available = False
    redis_client = None
    print(f"[REDIS INITIALIZATION WARNING] Redis server not available (falling back to in-memory dict): {e}", flush=True)

_in_memory_search_cache = {}

from django.conf import settings

MOCK_PLACES = {
    "nungambakkam railway station": {
        "place_id": "google_place_nung_rail",
        "formatted_address": "Nungambakkam Railway Station, Chennai, Tamil Nadu, India",
        "latitude": 13.0658,
        "longitude": 80.2328
    },
    "nungambakkam metro": {
        "place_id": "google_place_nung_metro",
        "formatted_address": "Nungambakkam Metro Station, Chennai, Tamil Nadu, India",
        "latitude": 13.0620,
        "longitude": 80.2310
    },
    "nungambakkam high road": {
        "place_id": "google_place_nung_road",
        "formatted_address": "Nungambakkam High Road, Chennai, Tamil Nadu, India",
        "latitude": 13.0605,
        "longitude": 80.2415
    },
    "loyola college": {
        "place_id": "google_place_loyola_coll",
        "formatted_address": "Loyola College, Nungambakkam, Chennai, Tamil Nadu, India",
        "latitude": 13.0626,
        "longitude": 80.2339
    },
    "loyola school": {
        "place_id": "google_place_loyola_sch",
        "formatted_address": "Loyola Matriculation Higher Secondary School, Kodambakkam, Chennai, Tamil Nadu, India",
        "latitude": 13.0610,
        "longitude": 80.2300
    },
    "chennai central": {
        "place_id": "google_place_central",
        "formatted_address": "Chennai Central Railway Station, Kannappar Thidal, Chennai, Tamil Nadu, India",
        "latitude": 13.0827,
        "longitude": 80.2707
    },
    "guindy railway station": {
        "place_id": "google_place_guindy_rail",
        "formatted_address": "Guindy Railway Station, Guindy, Chennai, Tamil Nadu, India",
        "latitude": 13.0084,
        "longitude": 80.2131
    },
    "airport": {
        "place_id": "google_place_airport",
        "formatted_address": "Chennai International Airport, Meenambakkam, Chennai, Tamil Nadu, India",
        "latitude": 12.9941,
        "longitude": 80.1709
    },
    "marina beach": {
        "place_id": "google_place_marina",
        "formatted_address": "Marina Beach, Mylapore, Chennai, Tamil Nadu, India",
        "latitude": 13.0382,
        "longitude": 80.2785
    },
    "tidel park": {
        "place_id": "google_place_tidel",
        "formatted_address": "Tidel Park, Taramani, Chennai, Tamil Nadu, India",
        "latitude": 12.9895,
        "longitude": 80.2483
    },
    "anna nagar": {
        "place_id": "google_place_annanagar",
        "formatted_address": "Anna Nagar, Chennai, Tamil Nadu, India",
        "latitude": 13.0850,
        "longitude": 80.2100
    },
    "velachery": {
        "place_id": "google_place_velachery",
        "formatted_address": "Velachery, Chennai, Tamil Nadu, India",
        "latitude": 12.9915,
        "longitude": 80.2185
    },
    "tambaram": {
        "place_id": "google_place_tambaram",
        "formatted_address": "Tambaram, Chennai, Tamil Nadu, India",
        "latitude": 12.9229,
        "longitude": 80.1274
    },
    "grand mall": {
        "place_id": "google_place_grand_mall",
        "formatted_address": "Grand Square Mall, Velachery, Chennai, Tamil Nadu, India",
        "latitude": 12.9792,
        "longitude": 80.2210
    },
    "grand square mall": {
        "place_id": "google_place_grand_mall",
        "formatted_address": "Grand Square Mall, Velachery, Chennai, Tamil Nadu, India",
        "latitude": 12.9792,
        "longitude": 80.2210
    },
    "grandmall": {
        "place_id": "google_place_grand_mall",
        "formatted_address": "Grand Square Mall, Velachery, Chennai, Tamil Nadu, India",
        "latitude": 12.9792,
        "longitude": 80.2210
    },
    "besant technologies": {
        "place_id": "google_place_besant_tech",
        "formatted_address": "Besant Technologies, Velachery, Chennai, Tamil Nadu, India",
        "latitude": 12.9818,
        "longitude": 80.2229
    }
}

class LocationSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response([])
        
        start_time = time.time()
        cache_key = f"namma_ride:google_autocomplete:{query.lower()}"
        
        # Check cache
        cached_results = None
        if redis_available and redis_client:
            try:
                data_bytes = redis_client.get(cache_key)
                if data_bytes:
                    cached_results = json.loads(data_bytes.decode('utf-8'))
                    print(f"[REDIS CACHE HIT] Autocomplete: '{query}'", flush=True)
            except Exception as e:
                print(f"[REDIS CACHE ERROR] {e}", flush=True)
        else:
            if cache_key in _in_memory_search_cache:
                cached_results = _in_memory_search_cache[cache_key]
                print(f"[IN-MEMORY CACHE HIT] Autocomplete: '{query}'", flush=True)
                
        if cached_results is not None:
            return Response(cached_results)

        tomtom_key = getattr(settings, 'TOMTOM_API_KEY', '')
        api_key = getattr(settings, 'GOOGLE_PLACES_API_KEY', '')
        results = []
        seen_place_ids = set()

        # 1. Match local mock data first
        q_clean = query.lower().strip()
        for k, val in MOCK_PLACES.items():
            k_clean = k.lower().strip()
            if q_clean in k_clean or k_clean in q_clean or any(word in k_clean for word in q_clean.split() if len(word) > 3):
                if val['place_id'] not in seen_place_ids:
                    seen_place_ids.add(val['place_id'])
                    results.append({
                        'name': val['formatted_address'],
                        'place_id': val['place_id']
                    })

        if tomtom_key:
            # Query TomTom Search/Fuzzy API (very typo-tolerant and returns POIs)
            url = f"https://api.tomtom.com/search/2/search/{urllib.parse.quote(query)}.json?key={tomtom_key}&countrySet=IN&lat=13.0827&lon=80.2707&radius=50000"
            print(f"[TOMTOM API REQUEST] Autocomplete URL: {url}", flush=True)
            try:
                headers = {'User-Agent': 'Mozilla/5.0'}
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    for item in data.get('results', []):
                        place_id = f"tt_{item.get('id')}"
                        if place_id not in seen_place_ids:
                            seen_place_ids.add(place_id)
                            results.append({
                                'name': item.get('address', {}).get('freeformAddress', query),
                                'place_id': place_id
                            })
                            details_key = f"namma_ride:tomtom_details:{place_id}"
                            pos = item.get('position', {})
                            details_val = {
                                "place_id": place_id,
                                "formatted_address": item.get('address', {}).get('freeformAddress', query),
                                "latitude": pos.get('lat'),
                                "longitude": pos.get('lon')
                            }
                            if redis_available and redis_client:
                                redis_client.setex(details_key, 3600, json.dumps(details_val))
                            else:
                                _in_memory_search_cache[details_key] = details_val
                print(f"[TOMTOM API SUCCESS] Found {len(results)} suggestions", flush=True)
            except Exception as e:
                print(f"[TOMTOM API ERROR] search error: {e}", flush=True)

        elif api_key:
            # Query real Google Places Autocomplete API
            params = {
                'input': query,
                'key': api_key,
                'components': 'country:in',
                'location': '13.0827,80.2707',
                'radius': '50000',
                'strictbounds': 'true'
            }
            url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?" + urllib.parse.urlencode(params)
            print(f"[GOOGLE API REQUEST] Autocomplete URL: {url}", flush=True)
            try:
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if data.get('status') == 'OK':
                        for pred in data.get('predictions', []):
                            p_id = pred.get('place_id')
                            if p_id not in seen_place_ids:
                                seen_place_ids.add(p_id)
                                results.append({
                                    'name': pred.get('description'),
                                    'place_id': p_id
                                })
                    else:
                        print(f"[GOOGLE API WARNING] Status: {data.get('status')}. Falling back to mocks/Nominatim.", flush=True)
            except Exception as e:
                print(f"[GOOGLE API ERROR] Autocomplete error: {e}", flush=True)

        # Fallback to Nominatim if results are still empty
        if not results:
            search_query = query if "chennai" in query.lower() else f"{query}, Chennai"
            params = {
                'q': search_query,
                'format': 'json',
                'limit': 10,
                'viewbox': '80.00,13.30,80.45,12.70',
                'bounded': 1
            }
            url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(params)
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/120.0.0.0'}
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    for item in data:
                        osm_type_char = item.get('osm_type', 'node')[0].upper()
                        osm_id = item.get('osm_id')
                        osm_place_id = f"osm_{osm_type_char}{osm_id}"
                        if osm_place_id not in seen_place_ids:
                            seen_place_ids.add(osm_place_id)
                            results.append({
                                'name': item.get('display_name'),
                                'place_id': osm_place_id
                            })
                            osm_details_key = f"namma_ride:osm_details:{osm_place_id}"
                            osm_details_val = {
                                "place_id": osm_place_id,
                                "formatted_address": item.get('display_name'),
                                "latitude": float(item.get('lat')),
                                "longitude": float(item.get('lon'))
                            }
                            if redis_available and redis_client:
                                redis_client.setex(osm_details_key, 3600, json.dumps(osm_details_val))
                            else:
                                _in_memory_search_cache[osm_details_key] = osm_details_val
            except Exception as e:
                print(f"[NOMINATIM FALLBACK ERROR] {e}", flush=True)

        # Cache suggestions
        if redis_available and redis_client:
            try:
                redis_client.setex(cache_key, 3600, json.dumps(results))
            except Exception as e:
                print(f"[REDIS CACHE SET ERROR] {e}", flush=True)
        else:
            _in_memory_search_cache[cache_key] = results

        response_time = time.time() - start_time
        print(f"[LOG SEARCH] Query: '{query}' | Suggestion Count: {len(results)} | Response Time: {response_time:.4f}s", flush=True)
        return Response(results)

class PlaceDetailsView(APIView):
    def get(self, request):
        place_id = request.query_params.get('place_id', '').strip()
        if not place_id:
            return Response({'error': 'place_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        cache_key = f"namma_ride:place_details:{place_id}"
        
        # Check cache
        cached_results = None
        if redis_available and redis_client:
            try:
                data_bytes = redis_client.get(cache_key)
                if data_bytes:
                    cached_results = json.loads(data_bytes.decode('utf-8'))
            except:
                pass
        else:
            if cache_key in _in_memory_search_cache:
                cached_results = _in_memory_search_cache[cache_key]
                
        if cached_results is not None:
            return Response(cached_results)

        # 1. Check if mock place
        for val in MOCK_PLACES.values():
            if val['place_id'] == place_id:
                res_data = {
                    'place_id': val['place_id'],
                    'formatted_address': val['formatted_address'],
                    'latitude': val['latitude'],
                    'longitude': val['longitude']
                }
                if redis_available and redis_client:
                    redis_client.setex(cache_key, 3600, json.dumps(res_data))
                else:
                    _in_memory_search_cache[cache_key] = res_data
                return Response(res_data)

        # Check if TomTom details cached
        if place_id.startswith('tt_'):
            details_key = f"namma_ride:tomtom_details:{place_id}"
            tomtom_cached = None
            if redis_available and redis_client:
                try:
                    d_bytes = redis_client.get(details_key)
                    if d_bytes:
                        tomtom_cached = json.loads(d_bytes.decode('utf-8'))
                except:
                    pass
            else:
                if details_key in _in_memory_search_cache:
                    tomtom_cached = _in_memory_search_cache[details_key]
            
            if tomtom_cached:
                # Cache under general place_details key too
                if redis_available and redis_client:
                    redis_client.setex(cache_key, 3600, json.dumps(tomtom_cached))
                else:
                    _in_memory_search_cache[cache_key] = tomtom_cached
                return Response(tomtom_cached)

        # 2. Check if OSM fallback cached details
        osm_details_key = f"namma_ride:osm_details:{place_id}"
        osm_cached = None
        if redis_available and redis_client:
            try:
                d_bytes = redis_client.get(osm_details_key)
                if d_bytes:
                    osm_cached = json.loads(d_bytes.decode('utf-8'))
            except:
                pass
        else:
            if osm_details_key in _in_memory_search_cache:
                osm_cached = _in_memory_search_cache[osm_details_key]
        
        if osm_cached:
            return Response(osm_cached)
            
        # If not cached but is OSM ID, look it up from Nominatim!
        if place_id.startswith('osm_'):
            osm_id_str = place_id[4:] # e.g. N247677540
            url = f"https://nominatim.openstreetmap.org/lookup?osm_ids={osm_id_str}&format=json"
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        item = data[0]
                        res_data = {
                            "place_id": place_id,
                            "formatted_address": item.get('display_name'),
                            "latitude": float(item.get('lat')),
                            "longitude": float(item.get('lon'))
                        }
                        if redis_available and redis_client:
                            redis_client.setex(cache_key, 3600, json.dumps(res_data))
                        else:
                            _in_memory_search_cache[cache_key] = res_data
                        return Response(res_data)
            except Exception as e:
                print(f"[NOMINATIM LOOKUP ERROR] {e}", flush=True)

        # 3. Query real Google Place Details API
        api_key = getattr(settings, 'GOOGLE_PLACES_API_KEY', '')
        if api_key and place_id.startswith('ChI'):
            params = {
                'place_id': place_id,
                'fields': 'geometry,formatted_address,name',
                'key': api_key
            }
            url = "https://maps.googleapis.com/maps/api/place/details/json?" + urllib.parse.urlencode(params)
            try:
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if data.get('status') == 'OK':
                        result = data.get('result', {})
                        loc = result.get('geometry', {}).get('location', {})
                        res_data = {
                            'place_id': place_id,
                            'formatted_address': result.get('formatted_address', result.get('name')),
                            'latitude': loc.get('lat', 13.0827),
                            'longitude': loc.get('lng', 80.2707)
                        }
                        if redis_available and redis_client:
                            redis_client.setex(cache_key, 3600, json.dumps(res_data))
                        else:
                            _in_memory_search_cache[cache_key] = res_data
                        return Response(res_data)
            except Exception as e:
                print(f"[GOOGLE PLACE DETAILS ERROR] {e}", flush=True)

        return Response({'error': 'Place details not found'}, status=status.HTTP_404_NOT_FOUND)

class CouponValidationView(APIView):
    def post(self, request):
        code = request.data.get('code', '').upper()
        try:
            coupon = Coupon.objects.get(code=code, active=True)
            return Response({
                'valid': True,
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'value': coupon.value
            })
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid or expired coupon'}, status=status.HTTP_400_BAD_REQUEST)

class FareEstimatorView(APIView):
    def post(self, request):
        pickup_name = request.data.get('pickup', '')
        drop_name = request.data.get('drop', '')
        coupon_code = request.data.get('coupon_code', '')
        
        # 1. Coordinate input from frontend
        pickup_lat = request.data.get('pickup_lat')
        pickup_lon = request.data.get('pickup_lon')
        drop_lat = request.data.get('drop_lat')
        drop_lon = request.data.get('drop_lon')
        
        # Fallback if coordinates not sent
        if not pickup_lat or not pickup_lon or not drop_lat or not drop_lon:
            def geocode(q):
                for val in MOCK_PLACES.values():
                    if q.lower() in val['formatted_address'].lower():
                        return val['latitude'], val['longitude']
                
                cache_key = f"namma_ride:geocode:{q.lower().strip()}"
                cached = None
                if redis_available and redis_client:
                    try:
                        cached = redis_client.get(cache_key)
                        if cached:
                            lat_lon = json.loads(cached.decode('utf-8'))
                            print(f"[REDIS GEOCACHE HIT] {q}", flush=True)
                            return lat_lon[0], lat_lon[1]
                    except:
                        pass
                else:
                    if cache_key in _in_memory_search_cache:
                        lat_lon = _in_memory_search_cache[cache_key]
                        print(f"[IN-MEMORY GEOCACHE HIT] {q}", flush=True)
                        return lat_lon[0], lat_lon[1]

                url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
                    'q': f"{q}, Chennai",
                    'format': 'json',
                    'limit': 1
                })
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(req, timeout=3) as response:
                        data = json.loads(response.read().decode('utf-8'))
                        if data:
                            lat_val = float(data[0]['lat'])
                            lon_val = float(data[0]['lon'])
                            if redis_available and redis_client:
                                try:
                                    redis_client.setex(cache_key, 86400, json.dumps([lat_val, lon_val]))
                                except:
                                    pass
                            else:
                                _in_memory_search_cache[cache_key] = [lat_val, lon_val]
                            return lat_val, lon_val
                except:
                    pass
                return None

            if not pickup_lat or not pickup_lon:
                coords = geocode(pickup_name)
                if coords:
                    pickup_lat, pickup_lon = coords
                else:
                    pickup_lat, pickup_lon = 13.0382, 80.2785
            if not drop_lat or not drop_lon:
                coords = geocode(drop_name)
                if coords:
                    drop_lat, drop_lon = coords
                else:
                    drop_lat, drop_lon = 13.0402, 80.2337
            
        # 2. Get route distance and duration
        distance_km = 6.2
        duration_min = 15
        
        # Calculate Haversine straight line approximation as initial dynamic estimation
        try:
            import math
            lat1, lon1 = float(pickup_lat), float(pickup_lon)
            lat2, lon2 = float(drop_lat), float(drop_lon)
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance_km = round(6371.0 * c * 1.3, 2)
            duration_min = max(3, int(distance_km * 2.5))
            print(f"[HAVERSINE ESTIMATION] Distance: {distance_km}km | Duration: {duration_min}mins", flush=True)
        except Exception as e:
            print(f"[HAVERSINE ERROR] {e}", flush=True)
            
        api_key = getattr(settings, 'GOOGLE_DIRECTIONS_API_KEY', '')
        route_resolved = False
        
        if api_key:
            directions_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={pickup_lat},{pickup_lon}&destination={drop_lat},{drop_lon}&key={api_key}"
            print(f"[GOOGLE DIRECTIONS API REQUEST] URL: {directions_url}", flush=True)
            try:
                req = urllib.request.Request(directions_url)
                with urllib.request.urlopen(req, timeout=4) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if data.get('status') == 'OK' and data.get('routes'):
                        leg = data['routes'][0]['legs'][0]
                        distance_km = leg.get('distance', {}).get('value', 6200) / 1000.0
                        duration_min = max(2, int(leg.get('duration', {}).get('value', 900) / 60.0))
                        route_resolved = True
                        print(f"[GOOGLE DIRECTIONS SUCCESS] Distance: {distance_km}km | Duration: {duration_min}mins", flush=True)
            except Exception as e:
                print(f"[GOOGLE DIRECTIONS ERROR] {e}. Falling back to OSRM.", flush=True)

        if not route_resolved:
            try:
                p_lat_r = round(float(pickup_lat), 3)
                p_lon_r = round(float(pickup_lon), 3)
                d_lat_r = round(float(drop_lat), 3)
                d_lon_r = round(float(drop_lon), 3)
                route_cache_key = f"namma_ride:route:{p_lat_r}:{p_lon_r}:{d_lat_r}:{d_lon_r}"
            except:
                route_cache_key = None

            cached_route = None
            if route_cache_key:
                if redis_available and redis_client:
                    try:
                        cached_route_bytes = redis_client.get(route_cache_key)
                        if cached_route_bytes:
                            cached_route = json.loads(cached_route_bytes.decode('utf-8'))
                            print(f"[REDIS ROUTE CACHE HIT] {route_cache_key}", flush=True)
                    except:
                        pass
                else:
                    if route_cache_key in _in_memory_search_cache:
                        cached_route = _in_memory_search_cache[route_cache_key]
                        print(f"[IN-MEMORY ROUTE CACHE HIT] {route_cache_key}", flush=True)

            if cached_route:
                distance_km = cached_route['distance_km']
                duration_min = cached_route['duration_min']
                route_resolved = True
            else:
                route_url = f"http://router.project-osrm.org/route/v1/driving/{pickup_lon},{pickup_lat};{drop_lon},{drop_lat}?overview=false"
                req = urllib.request.Request(route_url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(req, timeout=3) as response:
                        data = json.loads(response.read().decode('utf-8'))
                        if data and data.get('routes'):
                            route = data['routes'][0]
                            distance_km = route.get('distance', 6200.0) / 1000.0
                            duration_min = max(2, int(route.get('duration', 900.0) / 60.0))
                            
                            # Cache the route
                            if route_cache_key:
                                route_data = {'distance_km': distance_km, 'duration_min': duration_min}
                                if redis_available and redis_client:
                                    try:
                                        redis_client.setex(route_cache_key, 86400, json.dumps(route_data))
                                    except:
                                        pass
                                else:
                                    _in_memory_search_cache[route_cache_key] = route_data
                            route_resolved = True
                except:
                    pass

        # 3. Calculate Surge multiplier from SurgeZoneConfig and SurgeSchedule
        bike_mult = 1.0
        auto_mult = 1.0
        matched_zone = None
        
        # Substring search for matched zone (case-insensitive)
        for zone in SurgeZoneConfig.objects.filter(active=True):
            if zone.zone_id.lower() in pickup_name.lower():
                matched_zone = zone
                break
                
        # If no zone matched by name, fallback to first active zone or default 1.0
        if matched_zone:
            bike_mult = matched_zone.bike_multiplier
            auto_mult = matched_zone.auto_multiplier
            
            # Check if there is an active schedule for this zone
            from django.utils import timezone
            import datetime
            import json
            current_dt = timezone.localtime(timezone.now())
            current_date = current_dt.date()
            current_time = current_dt.time()
            current_weekday = current_dt.strftime('%A')
            
            active_schedules = SurgeSchedule.objects.filter(zone_id=matched_zone.zone_id, active=True)
            for sched in active_schedules:
                if sched.start_date <= current_date <= sched.end_date:
                    if sched.start_time <= current_time <= sched.end_time:
                        if sched.recurrence_type == 'One Time':
                            bike_mult = sched.multiplier
                            auto_mult = sched.multiplier
                            break
                        elif sched.recurrence_type == 'Daily':
                            bike_mult = sched.multiplier
                            auto_mult = sched.multiplier
                            break
                        elif sched.recurrence_type == 'Weekly':
                            try:
                                weekdays_list = json.loads(sched.weekdays)
                            except:
                                weekdays_list = [w.strip() for w in sched.weekdays.replace('[','').replace(']','').replace("'",'').replace('"','').split(',') if w.strip()]
                            if current_weekday in weekdays_list:
                                bike_mult = sched.multiplier
                                auto_mult = sched.multiplier
                                break
                        elif sched.recurrence_type == 'Monthly':
                            bike_mult = sched.multiplier
                            auto_mult = sched.multiplier
                            break

            # Apply global overrides and modifiers (e.g. Rain surge, Festival mode, Hotspot mode)
            rain_mode = False
            festival_mode = False
            hotspot_mode = False
            flood_mode = False
            surge_cap = True
            
            try:
                rain_setting = SystemSetting.objects.filter(key='rain_mode').first()
                if rain_setting and (rain_setting.value is True or str(rain_setting.value).lower() == 'true'):
                    rain_mode = True
            except:
                pass
            try:
                festival_setting = SystemSetting.objects.filter(key='festival_mode').first()
                if festival_setting and (festival_setting.value is True or str(festival_setting.value).lower() == 'true'):
                    festival_mode = True
            except:
                pass
            try:
                hotspot_setting = SystemSetting.objects.filter(key='hotspot_mode').first()
                if hotspot_setting and (hotspot_setting.value is True or str(hotspot_setting.value).lower() == 'true'):
                    hotspot_mode = True
            except:
                pass
            try:
                flood_setting = SystemSetting.objects.filter(key='flood_mode').first()
                if flood_setting and (flood_setting.value is True or str(flood_setting.value).lower() == 'true'):
                    flood_mode = True
            except:
                pass
            try:
                cap_setting = SystemSetting.objects.filter(key='surge_cap').first()
                if cap_setting:
                    surge_cap = (cap_setting.value is True or str(cap_setting.value).lower() == 'true')
            except:
                pass

            if flood_mode or matched_zone.flood_lockdown_enabled:
                bike_mult = 1.0
                auto_mult = 1.0
            else:
                if rain_mode or matched_zone.rain_enabled:
                    bike_mult += 0.3
                    auto_mult += 0.4
                if festival_mode or matched_zone.festival_enabled:
                    bike_mult += 0.2
                    auto_mult += 0.3
                if hotspot_mode or matched_zone.hotspot_enabled:
                    bike_mult += 0.2
                    auto_mult += 0.2
                
                if surge_cap:
                    bike_mult = min(2.0, bike_mult)
                    auto_mult = min(2.0, auto_mult)
            
            bike_mult = round(bike_mult, 1)
            auto_mult = round(auto_mult, 1)
        
        surge_mult = bike_mult

            
        # 4. Check Coupon
        discount_val = 0.0
        discount_type = None
        coupon_applied = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper(), active=True)
                discount_val = coupon.value
                discount_type = coupon.discount_type
                coupon_applied = coupon.code
            except Coupon.DoesNotExist:
                pass
                
        # 5. Compute base prices using requested formulas
        # Fetch dynamic Base Tariffs & Variable Rules configured by admin
        bike_base = 25.0
        bike_per_km = 6.0
        auto_base = 40.0
        auto_per_km = 14.0
        
        try:
            settings_obj = SystemSetting.objects.filter(key='admin_general_settings').first()
            if settings_obj:
                val = settings_obj.value
                if isinstance(val, str):
                    import json
                    val = json.loads(val)
                bike_base = float(val.get('bikeBase', bike_base))
                bike_per_km = float(val.get('bikePerKm', bike_per_km))
                auto_base = float(val.get('autoBase', auto_base))
                auto_per_km = float(val.get('autoPerKm', auto_per_km))
        except Exception as e:
            print(f"[FARE ESTIMATION WARNING] Error loading general settings: {e}", flush=True)

        # Bike: Base + (Distance * Per-Km) + (Duration * ₹1/min) + Platform Fee (₹3) + Surge
        bike_subtotal = bike_base + (distance_km * bike_per_km) + (duration_min * 1.0)
        bike_surge = bike_subtotal * (surge_mult - 1.0)
        bike_disc = (bike_subtotal * (discount_val / 100.0)) if discount_type == 'percentage' else (discount_val if discount_type == 'flat' else 0.0)
        bike_total = max(15.0, round(bike_subtotal + bike_surge + 3.0 - bike_disc))
        
        # Auto: Base + (Distance * Per-Km) + (Duration * ₹1.5/min) + Platform Fee (₹5) + Surge
        auto_subtotal = auto_base + (distance_km * auto_per_km) + (duration_min * 1.5)
        auto_surge = auto_subtotal * (surge_mult - 1.0)
        auto_disc = (auto_subtotal * (discount_val / 100.0)) if discount_type == 'percentage' else (discount_val if discount_type == 'flat' else 0.0)
        auto_total = max(25.0, round(auto_subtotal + auto_surge + 5.0 - auto_disc))
        
        # 6. Return dynamic estimations and AI bids
        return Response({
            'distance_km': round(distance_km, 2),
            'duration_min': duration_min,
            'surge_applied': surge_mult > 1.0,
            'surge_multiplier': surge_mult,
            'coupon_applied': coupon_applied,
            'rates': {
                'bike': {
                    'standard': bike_total,
                    'economy': max(15, round(bike_total * 0.92)),
                    'priority': round(bike_total * 1.12)
                },
                'auto': {
                    'standard': auto_total,
                    'economy': max(25, round(auto_total * 0.92)),
                    'priority': round(auto_total * 1.12)
                }
            }
        })

class ReverseGeocodingView(APIView):
    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if not lat or not lon:
            return Response({'error': 'lat and lon are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lat_rounded = round(float(lat), 3)
            lon_rounded = round(float(lon), 3)
            cache_key = f"namma_ride:reverse_geocode:{lat_rounded}:{lon_rounded}"
        except (ValueError, TypeError):
            return Response({'error': 'invalid lat/lon'}, status=status.HTTP_400_BAD_REQUEST)

        cached_address = None
        if redis_available and redis_client:
            try:
                cached_address_bytes = redis_client.get(cache_key)
                if cached_address_bytes:
                    cached_address = cached_address_bytes.decode('utf-8')
                    print(f"[REDIS REVERSE GEOCACHE HIT] {lat_rounded}, {lon_rounded}", flush=True)
            except:
                pass
        else:
            if cache_key in _in_memory_search_cache:
                cached_address = _in_memory_search_cache[cache_key]
                print(f"[IN-MEMORY REVERSE GEOCACHE HIT] {lat_rounded}, {lon_rounded}", flush=True)

        if cached_address:
            return Response({'address': cached_address})

        address = None
        api_key = getattr(settings, 'GOOGLE_GEOCODING_API_KEY', '')
        if api_key:
            params = {
                'latlng': f"{lat},{lon}",
                'key': api_key
            }
            url = "https://maps.googleapis.com/maps/api/geocode/json?" + urllib.parse.urlencode(params)
            print(f"[GOOGLE GEOCODING REQUEST] URL: {url}", flush=True)
            try:
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=4) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if data.get('status') == 'OK' and data.get('results'):
                        address = data['results'][0].get('formatted_address')
                        print(f"[GOOGLE GEOCODING SUCCESS] Resolved: {address}", flush=True)
            except Exception as e:
                print(f"[GOOGLE GEOCODING ERROR] {e}. Falling back.", flush=True)

        if not address:
            # To prevent slow, rate-limited Nominatim API calls from blocking the single-threaded Django dev server,
            # we calculate the closest place in MOCK_PLACES locally.
            try:
                closest_place = None
                min_dist = float('inf')
                import math
                
                lat_val = float(lat)
                lon_val = float(lon)
                
                for name, val in MOCK_PLACES.items():
                    dy = (val['latitude'] - lat_val) * 111000
                    dx = (val['longitude'] - lon_val) * 111000 * math.cos(math.radians(lat_val))
                    dist = math.sqrt(dx*dx + dy*dy)
                    if dist < min_dist:
                        min_dist = dist
                        closest_place = val
                
                if closest_place and min_dist < 2500:
                    # E.g. "Near Marina Beach, Chennai, Tamil Nadu"
                    name_part = closest_place['formatted_address'].split(',')[0]
                    address = f"Near {name_part}, Chennai, Tamil Nadu"
                else:
                    address = "Chennai Central, Chennai, Tamil Nadu"
            except Exception as e:
                print(f"[LOCAL GEOPARSING ERROR] {e}", flush=True)
                address = "Chennai Central, Chennai, Tamil Nadu"

        # Cache the resolved address
        if redis_available and redis_client:
            try:
                redis_client.setex(cache_key, 86400, address)
            except:
                pass
        else:
            _in_memory_search_cache[cache_key] = address

        print(f"[LOCAL REVERSE GEO RESOLVE] {lat_rounded}, {lon_rounded} -> {address}", flush=True)
        return Response({'address': address})

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_otp(to_email, otp_code):
    try:
        import os
        smtp_user = os.environ.get("SMTP_USER", "info.rideuu@gmail.com")
        from_email = os.environ.get("SMTP_FROM", smtp_user)
        app_password = os.environ.get("SMTP_PASSWORD", "lxilgubdjjolpwer")
        smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = f"Rideuu - Your Verification OTP is {otp_code}"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #090d16; color: #ffffff; padding: 20px; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #121824; border: 1px solid #facc15; border-radius: 10px; padding: 30px; text-align: left;">
                <h1 style="color: #facc15; text-align: center;">Rideuu Verification</h1>
                <p style="font-size: 16px; color: #ffffff;">Hello,</p>
                <p style="font-size: 16px; color: #ffffff;">Use the following OTP code to verify your account and complete your login/registration:</p>
                <div style="font-size: 32px; font-weight: bold; color: #090d16; background-color: #facc15; letter-spacing: 5px; margin: 20px 0; padding: 15px; border-radius: 8px; text-align: center;">
                    {otp_code}
                </div>
                <p style="font-size: 12px; color: #a0aec0; text-align: center;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10.0)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, app_password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        print(f"[SMTP SUCCESS] Sent OTP {otp_code} to {to_email}", flush=True)
        
        try:
            from .models import SystemSetting
            from django.utils import timezone
            SystemSetting.objects.update_or_create(
                key='last_smtp_status',
                defaults={'value': {
                    'status': 'SUCCESS',
                    'message': f"Sent OTP {otp_code} to {to_email}",
                    'to_email': to_email,
                    'timestamp': str(timezone.now())
                }}
            )
        except Exception as db_err:
            print(f"[SMTP DB LOG ERROR] {db_err}", flush=True)
            
        return True
    except Exception as e:
        import traceback
        err_msg = f"Failed to send email to {to_email}: {e}\n{traceback.format_exc()}"
        print(f"[SMTP ERROR] {err_msg}", flush=True)
        
        try:
            from .models import SystemSetting
            from django.utils import timezone
            SystemSetting.objects.update_or_create(
                key='last_smtp_status',
                defaults={'value': {
                    'status': 'ERROR',
                    'message': str(e),
                    'traceback': traceback.format_exc(),
                    'to_email': to_email,
                    'timestamp': str(timezone.now())
                }}
            )
        except Exception as db_err:
            print(f"[SMTP DB LOG ERROR] {db_err}", flush=True)
            
        return False


from django.contrib.auth.hashers import make_password, check_password
import random
from .models import OTPVerification

class SendOTPView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            role = request.data.get('role', 'customer')
            action = request.data.get('action', 'login')
            
            if not email:
                return Response({'error': 'Email ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            email_clean = email.strip().lower()
            if role == 'driver':
                exists = UserProfile.objects.filter(email=email_clean, role='driver').exists()
                
                if action == 'login' and not exists:
                    return Response({
                        'error': 'You are not registered as a rider. Please create a rider account.',
                        'code': 'RIDER_NOT_FOUND'
                    }, status=status.HTTP_444_NOT_FOUND if hasattr(status, 'HTTP_444_NOT_FOUND') else status.HTTP_404_NOT_FOUND)
                elif action == 'register' and exists:
                    return Response({
                        'error': 'Email address already registered as a rider. Please log in.',
                        'code': 'RIDER_ALREADY_EXISTS'
                    }, status=status.HTTP_400_BAD_REQUEST)

            otp_code = str(random.randint(1000, 9999))
            
            OTPVerification.objects.filter(email=email_clean).delete()
            otp_record = OTPVerification.objects.create(email=email_clean, otp=otp_code)
            print(f"[AUTH SendOTP] Generated OTP {otp_code} for email {email_clean}", flush=True)
            import threading
            threading.Thread(target=send_email_otp, args=(email_clean, otp_code), daemon=True).start()
            return Response({'success': True, 'otp': otp_code, 'email': email_clean})
        except Exception as e:
            import traceback
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        role = request.data.get('role', 'customer')
        name = request.data.get('name', 'Chennai Commuter')
        sub_role = request.data.get('sub_role', '')
        
        if not otp:
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = email.strip().lower()
        try:
            record = OTPVerification.objects.get(email=email)
            if record.otp != otp:
                return Response({'error': 'Invalid OTP code entered'}, status=status.HTTP_400_BAD_REQUEST)
        except OTPVerification.DoesNotExist:
            return Response({'error': 'No OTP generated for this email'}, status=status.HTTP_400_BAD_REQUEST)
            
        record.delete()
        
        # Parse extra fields
        phone_val = request.data.get('phone', '')
        if phone_val:
            phone_clean = phone_val.strip().replace(" ", "")
            if phone_clean.startswith("+91"):
                phone_clean = phone_clean[3:]
            phone_normalized = "+91 " + phone_clean
        else:
            phone_normalized = "+91 " + str(random.randint(9000000000, 9999999999))
            
        vehicle_type = request.data.get('vehicle_type', 'auto')
        if 'bike' in vehicle_type.lower():
            vehicle_type = 'bike'
        elif 'auto' in vehicle_type.lower():
            vehicle_type = 'auto'
        vehicle_model = request.data.get('vehicle_model', 'Bajaj RE Auto')
        vehicle_plate = request.data.get('vehicle_plate', 'TN 22 BZ 4421')
        vehicle_color = request.data.get('vehicle_color', 'Yellow')
        vehicle_year = request.data.get('vehicle_year', '2026')
        gender = request.data.get('gender', 'male')
        address = request.data.get('address', '')

        # Lookup user by email, or create new
        user, created = UserProfile.objects.get_or_create(
            email=email,
            defaults={
                'phone': phone_normalized,
                'name': name if name and name != 'Anonymous User' else 'Anonymous User',
                'role': role,
                'gender': gender if gender else 'male',
                'status': 'active' if role == 'customer' else 'new',
                'wallet_balance': 0.0,
                'upi_id': f"{name.lower().replace(' ', '.')}@okaxis" if name else "user@okaxis",
                'bank_account': "State Bank of India ****1234"
            }
        )
        
        # Ensure role is set to driver if logging in as driver
        if role == 'driver' and user.role != 'driver':
            user.role = 'driver'
            user.save(update_fields=['role'])

        if not created:
            if name and name != 'Anonymous User' and (not user.name or user.name == 'Anonymous User'):
                user.name = name
                user.save(update_fields=['name'])
            if gender and (not user.gender or user.gender == 'male') and user.gender != gender:
                user.gender = gender
                user.save(update_fields=['gender'])
            if phone_val and (not user.phone or user.phone.startswith("+91 99999") or user.phone.startswith("+91 90000")):
                user.phone = phone_normalized
                user.save(update_fields=['phone'])

        if sub_role:
            user.sub_role = sub_role
            user.save(update_fields=['sub_role'])
            
        token = f"jwt_mock_token_email_{user.id}_{int(time.time())}"
        
        if role == 'driver':
            vehicle = user.vehicles.first()
            if vehicle:
                incoming_custom = (
                    (vehicle_model and vehicle_model not in ('Bajaj RE Auto', 'Honda Activa')) or
                    (vehicle_plate and vehicle_plate != 'TN 22 BZ 4421')
                )
                is_default_vehicle = (
                    vehicle.model in ('Bajaj RE Auto', 'Honda Activa') and
                    vehicle.plate_number == 'TN 22 BZ 4421'
                )
                if is_default_vehicle or incoming_custom:
                    vehicle.vehicle_type = vehicle_type
                    vehicle.model = vehicle_model if vehicle_model else ('Honda Activa' if vehicle_type == 'bike' else 'Bajaj RE Auto')
                    vehicle.plate_number = vehicle_plate if vehicle_plate else 'TN 22 BZ 4421'
                    vehicle.save()
            else:
                Vehicle.objects.create(
                    driver=user,
                    model=vehicle_model if vehicle_model else ('Honda Activa' if vehicle_type == 'bike' else 'Bajaj RE Auto'),
                    plate_number=vehicle_plate if vehicle_plate else 'TN 22 BZ 4421',
                    vehicle_type=vehicle_type,
                    approved=True,
                    insurance_expiry='2027-03-15',
                    pollution_expiry='2026-11-20',
                    maintenance_days=14
                )
            
            if vehicle_type and user.active_vehicle_type != vehicle_type:
                user.active_vehicle_type = vehicle_type
                user.save(update_fields=['active_vehicle_type'])
            
        serializer = UserProfileSerializer(user)
        create_user_session(user, token, request)
        return Response({
            'token': token,
            'user': serializer.data
        })

class LoginEmailView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = email.strip().lower()
        
        try:
            # Handle multiple user profiles with the same email address by taking the first active admin, or super user
            users = UserProfile.objects.filter(email=email)
            if users.count() > 1:
                user = users.filter(role='admin').first() or users.first()
            elif users.count() == 1:
                user = users.first()
            else:
                raise UserProfile.DoesNotExist()
                
            if not user.password_hash:
                user.password_hash = make_password(password)
                user.save()
            elif not check_password(password, user.password_hash):
                return Response({'error': 'Invalid credentials entered'}, status=status.HTTP_401_UNAUTHORIZED)
        except UserProfile.DoesNotExist:
            name = email.split('@')[0].capitalize()
            role = 'admin' if 'admin' in email else 'customer'
            user = UserProfile.objects.create(
                phone="+91 " + str(random.randint(9000000000, 9999999999)),
                name=name,
                email=email,
                role=role,
                status='active',
                password_hash=make_password(password),
                wallet_balance=0.0 if role == 'customer' else 0.0,
                upi_id=f"{name.lower()}@okaxis"
            )
            
        serializer = UserProfileSerializer(user)
        token = f"jwt_mock_token_email_{user.id}_{int(time.time())}"
        create_user_session(user, token, request)
        return Response({
            'token': token,
            'user': serializer.data
        })

class GoogleAuthView(APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', 'Google User')
        google_id = request.data.get('google_id')
        
        if not email or not google_id:
            return Response({'error': 'Email and Google ID are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = email.strip().lower()
        
        try:
            user = UserProfile.objects.get(google_id=google_id)
        except UserProfile.DoesNotExist:
            try:
                user = UserProfile.objects.get(email=email)
                user.google_id = google_id
                user.save()
            except UserProfile.DoesNotExist:
                user = UserProfile.objects.create(
                    phone="+91 " + str(random.randint(9000000000, 9999999999)),
                    name=name,
                    email=email,
                    google_id=google_id,
                    role='customer',
                    status='active',
                    wallet_balance=0.0,
                    upi_id=f"{name.lower().replace(' ', '.')}@okaxis"
                )
                
        serializer = UserProfileSerializer(user)
        token = f"jwt_mock_token_google_{user.id}_{int(time.time())}"
        create_user_session(user, token, request)
        return Response({
            'token': token,
            'user': serializer.data
        })

class AppleAuthView(APIView):
    def post(self, request):
        email = request.data.get('email', 'apple.user@Rideuu.in')
        name = request.data.get('name', 'Apple User')
        apple_id = request.data.get('apple_id')
        
        if not apple_id:
            return Response({'error': 'Apple ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = email.strip().lower()
        
        try:
            user = UserProfile.objects.get(apple_id=apple_id)
        except UserProfile.DoesNotExist:
            try:
                user = UserProfile.objects.get(email=email)
                user.apple_id = apple_id
                user.save()
            except UserProfile.DoesNotExist:
                user = UserProfile.objects.create(
                    phone="+91 " + str(random.randint(9000000000, 9999999999)),
                    name=name,
                    email=email,
                    apple_id=apple_id,
                    role='customer',
                    status='active',
                    wallet_balance=0.0,
                    upi_id=f"{name.lower().replace(' ', '.')}@okaxis"
                )
                
        serializer = UserProfileSerializer(user)
        token = f"jwt_mock_token_apple_{user.id}_{int(time.time())}"
        create_user_session(user, token, request)
        return Response({
            'token': token,
            'user': serializer.data
        })

class LoginPasswordView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not phone and not email:
            return Response({'error': 'Phone number or email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            if email:
                email = email.strip().lower()
                user = UserProfile.objects.get(email=email)
            else:
                phone = phone.strip().replace(" ", "")
                if phone.startswith("+91"):
                    phone = phone[3:]
                user = UserProfile.objects.get(phone="+91 " + phone)
                
            if not user.password_hash:
                return Response({'error': 'No password set for this account. Please login via OTP first.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not check_password(password, user.password_hash):
                return Response({'error': 'Invalid credentials entered'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except UserProfile.DoesNotExist:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UserProfileSerializer(user)
        token = f"jwt_mock_token_pass_{user.id}_{int(time.time())}"
        create_user_session(user, token, request)
        return Response({
            'token': token,
            'user': serializer.data
        })


class SOSAlertViewSet(viewsets.ModelViewSet):
    queryset = SOSAlert.objects.all()
    serializer_class = SOSAlertSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return SOSAlert.objects.none()
        if user.role == 'admin':
            return SOSAlert.objects.all().order_by('-id')
        return SOSAlert.objects.filter(models.Q(customer=user) | models.Q(driver=user)).order_by('-id')

    def create(self, request, *args, **kwargs):
        ride_id = request.data.get('ride')
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        device_info = request.data.get('device_info', '')
        speed = request.data.get('speed')
        direction = request.data.get('direction')
        
        if lat is None or lon is None:
            return Response({'error': 'latitude and longitude are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ride = None
        customer = None
        driver = None
        
        if ride_id:
            try:
                ride = Ride.objects.get(id=ride_id)
                customer = ride.customer
                driver = ride.driver
            except Ride.DoesNotExist:
                return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
                
        if not customer:
            customer = get_user_from_token(request)
            
        if not customer:
            return Response({'error': 'Customer session not found'}, status=status.HTTP_401_UNAUTHORIZED)
            
        sos_alert = SOSAlert.objects.create(
            ride=ride,
            customer=customer,
            driver=driver,
            latitude=float(lat),
            longitude=float(lon),
            device_info=device_info,
            status='ACTIVE',
            priority='HIGH',
            current_speed=float(speed) if speed is not None else None,
            direction=direction
        )

        # Trigger SMS and Push notification simulation
        ride_id_str = f"#{ride.id}" if ride else "N/A"
        customer_name = ride.customer.name if ride else customer.name
        print(f"\n[SOS TRIGGERED] SMS sent to trusted contacts: Amma, Brother. Alert message: Customer {customer_name} feels unsafe! (Ride: {ride_id_str})", flush=True)
        print(f"[SOS TRIGGERED] Push Notification sent to Operations Team: HIGH Priority Alert raised. (Ride: {ride_id_str})", flush=True)

        return Response(SOSAlertSerializer(sos_alert).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_snapshot(self, request, pk=None):
        sos_alert = self.get_object()
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        speed = request.data.get('speed')
        direction = request.data.get('direction')
        
        if lat is None or lon is None:
            return Response({'error': 'latitude and longitude are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        snapshot = SOSLocationSnapshot.objects.create(
            sos_alert=sos_alert,
            latitude=float(lat),
            longitude=float(lon),
            speed=float(speed) if speed is not None else None,
            direction=direction
        )
        
        # Update current alert stats
        sos_alert.latitude = float(lat)
        sos_alert.longitude = float(lon)
        if speed is not None:
            sos_alert.current_speed = float(speed)
        if direction is not None:
            sos_alert.direction = direction
        sos_alert.save()

        print(f"[SOS TRACKING] Alert #{sos_alert.id} location updated: Lat={lat}, Lng={lon}, Speed={speed}, Dir={direction}", flush=True)

        return Response(SOSLocationSnapshotSerializer(snapshot).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        from django.utils import timezone
        sos_alert = self.get_object()
        # Resolve all active SOS alerts for this customer to avoid orphaned active alerts
        SOSAlert.objects.filter(customer=sos_alert.customer, status='ACTIVE').update(
            status='RESOLVED',
            resolved_at=timezone.now()
        )
        sos_alert.status = 'RESOLVED'
        sos_alert.resolved_at = timezone.now()
        sos_alert.save()

        # Generate Audit Log in terminal console as required
        print(f"\n[SOS AUDIT LOG] Alert #{sos_alert.id} RESOLVED. Ride #{sos_alert.ride_id}, Customer #{sos_alert.customer_id}, Rider #{sos_alert.driver_id}. Resolved at {sos_alert.resolved_at}", flush=True)

        return Response(SOSAlertSerializer(sos_alert).data)

