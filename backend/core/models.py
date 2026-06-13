from django.db import models

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('blacklisted', 'Blacklisted'),
        ('new', 'New'),
    ]
    
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    sub_role = models.CharField(max_length=50, blank=True, null=True, default='') # super_admin, operations, finance, support
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    apple_id = models.CharField(max_length=255, blank=True, null=True)
    wallet_balance = models.FloatField(default=0.0)
    incentive_balance = models.FloatField(default=0.0)
    bonus_balance = models.FloatField(default=0.0)
    referral_code = models.CharField(max_length=50, blank=True)
    referral_abuse_flag = models.BooleanField(default=False)
    online = models.BooleanField(default=False)
    upi_id = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=100, blank=True)
    women_priority_match = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    can_go_online = models.BooleanField(default=False)
    kyc_status = models.CharField(max_length=20, default='PENDING')
    account_status = models.CharField(max_length=50, default='PROFILE_INCOMPLETE')
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    last_location_update = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    wallet_went_negative_at = models.IntegerField(default=0)
    no_commission_expiry = models.IntegerField(default=0)
    gender = models.CharField(max_length=20, default='male')
    women_safety_verified = models.BooleanField(default=False)
    emergency_contact_name = models.CharField(max_length=100, blank=True, default='')
    emergency_contact_phone = models.CharField(max_length=50, blank=True, default='')
    notif_push = models.BooleanField(default=True)
    notif_incentives = models.BooleanField(default=True)
    availability_schedule = models.TextField(default='[]')
    active_vehicle_type = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

class Vehicle(models.Model):
    driver = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vehicles')
    model = models.CharField(max_length=100)
    plate_number = models.CharField(max_length=50)
    vehicle_type = models.CharField(max_length=20, choices=[('auto', 'Auto'), ('bike', 'Bike')])
    approved = models.BooleanField(default=False)
    insurance_expiry = models.DateField(null=True, blank=True)
    pollution_expiry = models.DateField(null=True, blank=True)
    maintenance_days = models.IntegerField(default=30)

    def __str__(self):
        return f"{self.model} - {self.plate_number}"

class KYCDocument(models.Model):
    driver = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='kyc_documents')
    document_type = models.CharField(max_length=50) # aadhaar, license, vehicle, insurance, selfie, profile_photo
    status = models.CharField(max_length=20, default='pending') # pending, progress, done, rejected
    rejection_reason = models.TextField(blank=True)
    file = models.FileField(upload_to='kyc_documents/', null=True, blank=True)
    file_data = models.TextField(blank=True) # stores name or base64 data reference

    def __str__(self):
        return f"{self.driver.name} - {self.document_type} ({self.status})"

class Ride(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('pickup', 'Pickup'),
        ('otp', 'OTP'),
        ('trip', 'Trip'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('SCHEDULED', 'Scheduled'),
        ('MATCHING_PENDING', 'Matching Pending'),
        ('RIDER_ASSIGNED', 'Rider Assigned'),
        ('DRIVER_EN_ROUTE', 'Driver En Route'),
        ('DRIVER_ARRIVED', 'Driver Arrived'),
        ('RIDE_STARTED', 'Ride Started'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    ride_type = models.CharField(max_length=20, default='NORMAL', choices=[('NORMAL', 'Normal'), ('SCHEDULED', 'Scheduled')])
    scheduled_date = models.CharField(max_length=50, blank=True, null=True)
    scheduled_time = models.CharField(max_length=50, blank=True, null=True)
    scheduled_timestamp = models.DateTimeField(blank=True, null=True)
    pickup_location = models.CharField(max_length=255, blank=True, null=True)
    drop_location = models.CharField(max_length=255, blank=True, null=True)
    estimated_fare = models.FloatField(blank=True, null=True)

    customer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='customer_rides')
    driver = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_rides')
    pickup = models.CharField(max_length=255)
    pickup_sub = models.CharField(max_length=255, blank=True)
    dropoff = models.CharField(max_length=255)
    dropoff_sub = models.CharField(max_length=255, blank=True)
    fare = models.FloatField()
    distance = models.FloatField()
    duration = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    otp = models.CharField(max_length=6, default='1234')
    created_at = models.DateTimeField(auto_now_add=True)
    surge_multiplier = models.FloatField(default=1.0)
    rain_bonus = models.FloatField(default=0.0)
    rating_customer = models.IntegerField(null=True, blank=True)
    rating_driver = models.IntegerField(null=True, blank=True)
    vehicle_type = models.CharField(max_length=20, default='bike')
    completion_step = models.IntegerField(default=-1)
    rejected_drivers = models.TextField(default='', blank=True)
    last_rejected_at = models.IntegerField(default=0)
    payment_mode = models.CharField(max_length=20, default='cash')
    women_safety_match = models.BooleanField(default=False)


    def __str__(self):
        return f"Ride #{self.id} from {self.pickup} to {self.dropoff} ({self.status})"

class Transaction(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transactions')
    title = models.CharField(max_length=255)
    amount = models.CharField(max_length=50) # e.g. "+₹142.00" or "-₹2000.00"
    date = models.CharField(max_length=100) # text representation for convenience
    positive = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default='paid') # paid, pending, failed
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.title} ({self.amount})"

class SupportTicket(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='open') # open, resolved
    date = models.CharField(max_length=100)
    chat = models.JSONField(default=list) # stores list of message objects: {"sender": "rider"|"support", "message": "...", "time": "..."}

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject} ({self.status})"

class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()

    def __str__(self):
        return self.key

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('flat', 'Flat')])
    value = models.FloatField()
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.value})"

class OTPVerification(models.Model):
    phone = models.CharField(max_length=100, blank=True, null=True, unique=True)
    email = models.CharField(max_length=100, blank=True, null=True, unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.phone or self.email} - {self.otp}"

class UserSession(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sessions')
    device = models.CharField(max_length=255)
    ip_address = models.CharField(max_length=100)
    location = models.CharField(max_length=255, default='Chennai')
    last_active = models.DateTimeField(auto_now=True)
    token = models.CharField(max_length=255, unique=True)
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.name} - {self.device} ({self.ip_address})"

class RideDispatch(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='dispatches')
    driver = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='dispatches')
    status = models.CharField(max_length=20, default='offered') # offered, accepted, rejected, timeout
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dispatch for Ride #{self.ride.id} to Driver {self.driver.name} ({self.status})"

class DriverAvailability(models.Model):
    driver = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='availability')
    is_available = models.BooleanField(default=True)
    last_ping = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Driver Availability for {self.driver.name} - Available: {self.is_available}"

class MatchingAttempt(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='matching_attempts')
    radius = models.FloatField() # in meters
    drivers_considered = models.ManyToManyField(UserProfile, related_name='matching_attempts_considered')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Matching Attempt for Ride #{self.ride.id} at radius {self.radius}m"

class TrackingHistory(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='tracking_history')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tracking for Ride #{self.ride.id} at {self.timestamp}"


class SOSAlert(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
    ]
    PRIORITY_CHOICES = [
        ('HIGH', 'High'),
        ('NORMAL', 'Normal'),
    ]

    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, null=True, blank=True, related_name='sos_alerts')
    customer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='customer_sos_alerts')
    driver = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_sos_alerts')
    latitude = models.FloatField()
    longitude = models.FloatField()
    device_info = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='HIGH')
    current_speed = models.FloatField(null=True, blank=True)
    direction = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"SOS Alert #{self.id} for Ride #{self.ride_id} - Status: {self.status}"


class SOSLocationSnapshot(models.Model):
    sos_alert = models.ForeignKey(SOSAlert, on_delete=models.CASCADE, related_name='snapshots')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    direction = models.CharField(max_length=50, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SOS Location Snapshot for Alert #{self.sos_alert_id} at {self.timestamp}"


class Campaign(models.Model):
    title = models.CharField(max_length=255)
    audience = models.CharField(max_length=255)
    sent_count = models.CharField(max_length=50, default="0")
    open_rate = models.CharField(max_length=50, default="0%")
    channel = models.CharField(max_length=100)
    message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.channel})"


class SurgeZoneConfig(models.Model):
    zone_id = models.CharField(max_length=100, unique=True)
    bike_multiplier = models.FloatField(default=1.0)
    auto_multiplier = models.FloatField(default=1.0)
    rain_enabled = models.BooleanField(default=False)
    festival_enabled = models.BooleanField(default=False)
    hotspot_enabled = models.BooleanField(default=False)
    flood_lockdown_enabled = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'surge_zone_config'

    def __str__(self):
        return f"{self.zone_id} Surge Config (Active: {self.active})"


class SurgeSchedule(models.Model):
    zone_id = models.CharField(max_length=100)
    multiplier = models.FloatField(default=1.0)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    recurrence_type = models.CharField(max_length=50) # One Time, Daily, Weekly, Monthly
    weekdays = models.CharField(max_length=200, default='[]') # e.g. JSON string of list
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'surge_schedules'

    def __str__(self):
        return f"{self.zone_id} Schedule ({self.multiplier}x, Active: {self.active})"




