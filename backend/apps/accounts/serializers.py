"""
Serializers for User authentication and profile management.
"""

import re

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


def normalize_phone(phone: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if cleaned.startswith("+880"):
        cleaned = "0" + cleaned[4:]
    elif cleaned.startswith("880"):
        cleaned = "0" + cleaned[3:]
    return cleaned


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "name",
            "district",
            "upazila",
            "role",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            "min_length": "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে (Password must be at least 8 characters)."
        },
    )

    class Meta:
        model = User
        fields = [
            "phone",
            "password",
            "name",
            "district",
            "upazila",
            "role",
        ]

    def validate_phone(self, value):
        normalized = normalize_phone(value)
        if not re.match(r"^01[3-9]\d{8}$", normalized):
            raise serializers.ValidationError(
                "সঠিক বাংলাদেশি মোবাইল নম্বর দিন, যেমন: 01712345678 (Provide a valid 11-digit Bangladeshi phone number)."
            )
        if User.objects.filter(phone=normalized).exists():
            raise serializers.ValidationError(
                "এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত (This phone number is already registered)."
            )
        return normalized

    def create(self, validated_data):
        role = validated_data.get("role", User.Role.FARMER)
        # Officers start unverified until admin checks them
        is_verified = False if role == User.Role.OFFICER else True

        user = User.objects.create_user(
            phone=validated_data["phone"],
            password=validated_data["password"],
            name=validated_data["name"],
            district=validated_data.get("district", ""),
            upazila=validated_data.get("upazila", ""),
            role=role,
            is_verified=is_verified,
        )
        return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = normalize_phone(attrs.get("phone", ""))
        password = attrs.get("password", "")

        user = authenticate(username=phone, password=password)
        if not user:
            raise serializers.ValidationError(
                "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে (Invalid phone number or password)."
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে (User account is disabled)."
            )

        attrs["user"] = user
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "district", "upazila"]
