from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import KYCDocument, Vehicle, UserProfile, Ride
from .services import recalculate_driver_status

@receiver(post_save, sender=KYCDocument)
@receiver(post_delete, sender=KYCDocument)
def on_kyc_change(sender, instance, **kwargs):
    if instance.driver:
        recalculate_driver_status(instance.driver)

@receiver(post_save, sender=Vehicle)
@receiver(post_delete, sender=Vehicle)
def on_vehicle_change(sender, instance, **kwargs):
    if instance.driver:
        recalculate_driver_status(instance.driver)

@receiver(post_save, sender=Ride)
def on_ride_created(sender, instance, created, **kwargs):
    if created or instance.status in ['pending', 'requested']:
        # Only trigger dispatch if status is pending/requested and no driver is assigned yet
        if not instance.driver and instance.status in ['pending', 'requested']:
            from .tasks import trigger_dispatch_ride
            trigger_dispatch_ride(instance.id)

