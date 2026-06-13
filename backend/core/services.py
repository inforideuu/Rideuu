from datetime import date

def recalculate_driver_status(driver):
    """
    Recalculates driver status, progress, and can_go_online:
    Profile Completed = 10%
    Aadhaar Uploaded = 15%
    License Uploaded = 15%
    Vehicle Added = 15%
    RC Uploaded = 15%
    Insurance Uploaded = 15%
    Selfie Uploaded = 15%
    Total = 100%
    """
    if driver.role != 'driver':
        return 100, 'VERIFIED'

    # Get document status mapping
    docs = {d.document_type: d.status for d in driver.kyc_documents.all()}
    
    # Check Profile Completed (10%)
    # Completed if name and phone are set, and profile_photo exists in progress or done
    profile_completed = bool(
        driver.name and 
        driver.phone and 
        docs.get('profile_photo') in ['progress', 'done']
    )
    
    progress = 0
    if profile_completed:
        progress += 10
        
    if docs.get('aadhaar') in ['progress', 'done']:
        progress += 15
    if docs.get('license') in ['progress', 'done']:
        progress += 15
        
    # Vehicle Added (15%)
    vehicle_added = driver.vehicles.exists()
    if vehicle_added:
        progress += 15
        
    if docs.get('vehicle') in ['progress', 'done']:
        progress += 15
    if docs.get('insurance') in ['progress', 'done']:
        progress += 15
    if docs.get('selfie') in ['progress', 'done']:
        progress += 15
        
    progress = min(100, progress)
    
    # KYC Status transitions:
    # No documents -> NOT_STARTED
    # Partial uploads -> IN_PROGRESS
    # All uploads completed -> UNDER_REVIEW
    # Admin approved all -> VERIFIED
    # Any rejection -> REJECTED
    
    required_docs = ['aadhaar', 'license', 'vehicle', 'insurance', 'profile_photo', 'selfie']
    uploaded_types = [t for t in required_docs if docs.get(t) in ['progress', 'done', 'rejected']]
    approved_types = [t for t in required_docs if docs.get(t) == 'done']
    rejected_types = [t for t in required_docs if docs.get(t) == 'rejected']
    
    vehicle_approved = driver.vehicles.filter(approved=True).exists()
    
    if len(rejected_types) > 0:
        kyc_status = 'REJECTED'
    elif len(approved_types) == len(required_docs) and vehicle_approved:
        kyc_status = 'VERIFIED'
    elif len(uploaded_types) == len(required_docs):
        kyc_status = 'UNDER_REVIEW'
    elif len(uploaded_types) > 0:
        kyc_status = 'IN_PROGRESS'
    else:
        kyc_status = 'NOT_STARTED'
        
    # Account status transitions:
    if kyc_status == 'VERIFIED':
        account_status = 'ACCOUNT_ACTIVE'
        # Auto-activate user profile if status was PROFILE_INCOMPLETE or new
        if driver.status in ['new', 'PROFILE_INCOMPLETE']:
            driver.status = 'active'
    elif kyc_status == 'REJECTED':
        account_status = 'REJECTED'
    else:
        account_status = 'PROFILE_INCOMPLETE'
        
    # Negative wallet balance check
    if driver.wallet_balance < 0:
        if not driver.wallet_went_negative_at:
            import time
            driver.wallet_went_negative_at = int(time.time())
            # Create warning ticket
            from .models import SupportTicket
            SupportTicket.objects.create(
                user=driver,
                subject=f"Warning: Negative Wallet Balance for Driver {driver.name}",
                status="open",
                date=str(date.today()),
                chat=[{
                    "sender": "support",
                    "message": f"Driver {driver.name} (Phone: {driver.phone}) has entered a negative wallet balance of \u20b9{driver.wallet_balance:.2f}. Account will be suspended if not cleared in 2 days.",
                    "time": str(date.today())
                }]
            )
        else:
            import time
            # Check if suspended already
            if driver.status != 'suspended' and (int(time.time()) - driver.wallet_went_negative_at) > 2 * 24 * 3600:
                driver.status = 'suspended'
                # Create suspension ticket
                from .models import SupportTicket
                SupportTicket.objects.create(
                    user=driver,
                    subject=f"Account Suspended: Negative Balance for Driver {driver.name}",
                    status="open",
                    date=str(date.today()),
                    chat=[{
                        "sender": "support",
                        "message": f"Driver {driver.name} (Phone: {driver.phone}) has been suspended because the negative wallet balance of \u20b9{driver.wallet_balance:.2f} has persisted for more than 2 days.",
                        "time": str(date.today())
                    }]
                )
    else:
        # Revert suspension if it was due to negative balance
        if driver.wallet_went_negative_at > 0:
            driver.wallet_went_negative_at = 0
            if driver.status == 'suspended':
                driver.status = 'active'
                # Log a ticket saying account reactivated
                from .models import SupportTicket
                SupportTicket.objects.create(
                    user=driver,
                    subject=f"Account Reactivated: Driver {driver.name}",
                    status="resolved",
                    date=str(date.today()),
                    chat=[{
                        "sender": "support",
                        "message": f"Driver {driver.name} (Phone: {driver.phone}) has cleared the negative balance (Current: \u20b9{driver.wallet_balance:.2f}). Account reactivated.",
                        "time": str(date.today())
                    }]
                )

    # Go Online eligibility check:
    can_go_online = (
        profile_completed and
        docs.get('aadhaar') == 'done' and
        docs.get('license') == 'done' and
        docs.get('vehicle') == 'done' and
        docs.get('insurance') == 'done' and
        docs.get('selfie') == 'done' and
        vehicle_approved and
        kyc_status == 'VERIFIED' and
        driver.status == 'active'
    )
    
    if not can_go_online:
        driver.online = False
    
    driver.is_verified = (kyc_status == 'VERIFIED')
    driver.can_go_online = can_go_online
    driver.kyc_status = kyc_status
    driver.account_status = account_status
    driver.save(update_fields=['is_verified', 'can_go_online', 'kyc_status', 'account_status', 'status', 'online', 'wallet_went_negative_at'])
    
    return progress, kyc_status

def is_rider_eligible_for_matching(driver):
    """
    Riders must satisfy all matching engine eligibility checks:
    - Active account
    - Verified KYC
    - All required documents are approved
    - Vehicle is approved
    - No document has expired
    - Not suspended/blocked
    """
    if driver.role != 'driver':
        return False
    if driver.status != 'active':
        return False
    if driver.kyc_status != 'VERIFIED' or not driver.is_verified:
        return False
    
    # Check document status
    docs = {d.document_type: d.status for d in driver.kyc_documents.all()}
    required_docs = ['aadhaar', 'license', 'vehicle', 'insurance', 'profile_photo', 'selfie']
    for t in required_docs:
        if docs.get(t) != 'done':
            return False
            
    # Check vehicle approval
    vehicle = driver.vehicles.filter(approved=True).first()
    if not vehicle:
        return False
        
    # Check document expiration
    today = date.today()
    if vehicle.insurance_expiry and vehicle.insurance_expiry < today:
        return False
    if vehicle.pollution_expiry and vehicle.pollution_expiry < today:
        return False
        
    return True
