from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_userprofile_current_latitude_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='RideDispatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(default='offered', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('driver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dispatches', to='core.userprofile')),
                ('ride', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dispatches', to='core.ride')),
            ],
        ),
        migrations.CreateModel(
            name='DriverAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_available', models.BooleanField(default=True)),
                ('last_ping', models.DateTimeField(auto_now=True)),
                ('driver', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='availability', to='core.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='MatchingAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('radius', models.FloatField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('drivers_considered', models.ManyToManyField(related_name='matching_attempts_considered', to='core.userprofile')),
                ('ride', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matching_attempts', to='core.ride')),
            ],
        ),
        migrations.CreateModel(
            name='TrackingHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('ride', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tracking_history', to='core.ride')),
            ],
        ),
    ]
