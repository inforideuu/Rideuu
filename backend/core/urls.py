from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, VehicleViewSet, KYCDocumentViewSet,
    RideViewSet, TransactionViewSet, SupportTicketViewSet, SystemSettingViewSet, UserSessionViewSet,
    LocationSearchView, FareEstimatorView, CouponValidationView, ReverseGeocodingView,
    PlaceDetailsView, SendOTPView, VerifyOTPView, LoginEmailView, GoogleAuthView, AppleAuthView,
    LoginPasswordView, SOSAlertViewSet, CouponViewSet, CampaignViewSet,
    SurgeZoneConfigViewSet, SurgeScheduleViewSet
)

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='user')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'kyc', KYCDocumentViewSet, basename='kyc')
router.register(r'rides', RideViewSet, basename='ride')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'tickets', SupportTicketViewSet, basename='ticket')
router.register(r'settings', SystemSettingViewSet, basename='setting')
router.register(r'auth/sessions', UserSessionViewSet, basename='session')
router.register(r'sos_alerts', SOSAlertViewSet, basename='sos_alert')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'surge-zones', SurgeZoneConfigViewSet, basename='surge-zone')
router.register(r'surge-schedules', SurgeScheduleViewSet, basename='surge-schedule')


urlpatterns = [
    path('location/search/', LocationSearchView.as_view(), name='location-search'),
    path('location/details/', PlaceDetailsView.as_view(), name='place-details'),
    path('location/reverse/', ReverseGeocodingView.as_view(), name='location-reverse'),
    path('rides/estimate/', FareEstimatorView.as_view(), name='fare-estimate'),
    path('coupons/validate/', CouponValidationView.as_view(), name='coupon-validate'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/login-email/', LoginEmailView.as_view(), name='login-email'),
    path('auth/login-password/', LoginPasswordView.as_view(), name='login-password'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('auth/apple/', AppleAuthView.as_view(), name='apple-auth'),
    path('', include(router.urls)),
]
