"""
Seed command to create demo admin, verified extension officer, and farmer users.
Generates random passwords and prints them once.
"""

import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with demo users (Admin, Officer, Farmer) and output credentials."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding demo users for Mrittika AI..."))

        users_to_create = [
            {
                "phone": "01700000001",
                "name": "সিস্টেম অ্যাডমিন (System Admin)",
                "role": "ADMIN",
                "district": "Dhaka",
                "upazila": "Dhaka Sadar",
                "is_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "phone": "01700000002",
                "name": "কৃষি কর্মকর্তা ড. মো. রফিকুল ইসলাম",
                "role": "OFFICER",
                "district": "Bogra",
                "upazila": "Sherpur",
                "is_verified": True,
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "phone": "01700000003",
                "name": "কৃষক আকমল হোসেন",
                "role": "FARMER",
                "district": "Bogra",
                "upazila": "Sherpur",
                "is_verified": False,
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        credentials = []

        for udata in users_to_create:
            phone = udata["phone"]
            password = secrets.token_urlsafe(10)
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={
                    "name": udata["name"],
                    "role": udata["role"],
                    "district": udata["district"],
                    "upazila": udata["upazila"],
                    "is_verified": udata["is_verified"],
                    "is_staff": udata["is_staff"],
                    "is_superuser": udata["is_superuser"],
                },
            )
            user.set_password(password)
            user.save()
            status = "Created" if created else "Updated password for"
            credentials.append({
                "role": udata["role"],
                "name": udata["name"],
                "phone": phone,
                "password": password,
                "status": status,
            })

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("MRITTIKA AI - DEMO USERS GENERATED"))
        self.stdout.write("=" * 60)
        for cred in credentials:
            self.stdout.write(f"Role:     {cred['role']}")
            self.stdout.write(f"Name:     {cred['name']}")
            self.stdout.write(f"Phone:    {cred['phone']}")
            self.stdout.write(f"Password: {cred['password']}")
            self.stdout.write("-" * 60)
        self.stdout.write(self.style.WARNING("NOTICE: Keep these credentials secure. Passwords printed once.\n"))
