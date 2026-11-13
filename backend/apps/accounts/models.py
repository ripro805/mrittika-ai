"""
Custom User model for Mrittika AI.
Uses phone number as primary login identifier with roles: FARMER, OFFICER, ADMIN.
"""

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        phone = phone.strip()
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        FARMER = "FARMER", "কৃষক (Farmer)"
        OFFICER = "OFFICER", "কৃষি কর্মকর্তা (Extension Officer)"
        ADMIN = "ADMIN", "প্রশাসক (Admin)"

    phone = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="মোবাইল নম্বর (Phone)",
    )
    name = models.CharField(
        max_length=150,
        verbose_name="পূর্ণ নাম (Full Name)",
    )
    district = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="জেলা (District)",
    )
    upazila = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="উপজেলা (Upazila)",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.FARMER,
        verbose_name="ভূমিকা (Role)",
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this officer has been verified by an administrator.",
        verbose_name="যাচাইকৃত (Verified)",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.role}"
