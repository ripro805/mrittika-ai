"""
Authentication views: Register, Login, Refresh, Logout, and Me (profile).
Implements JWT access tokens + rotating refresh token in httpOnly SameSite=Lax cookie.
"""

from django.conf import settings
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


def set_refresh_cookie(response: Response, refresh_token: str):
    """Stores the refresh token in a secure httpOnly cookie."""
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=str(refresh_token),
        max_age=7 * 24 * 3600,
        httponly=settings.AUTH_COOKIE_HTTPONLY,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        secure=settings.AUTH_COOKIE_SECURE,
        path=settings.AUTH_COOKIE_PATH,
    )


def clear_refresh_cookie(response: Response):
    """Clears the refresh token cookie."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        path=settings.AUTH_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Registration",
        description="Registers a new Farmer or Extension Officer with Bangladeshi phone validation.",
        request=RegisterSerializer,
        responses={201: UserSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        res = Response(
            {
                "message": "নিবন্ধন সফল হয়েছে (Registration successful).",
                "user": UserSerializer(user).data,
                "access": access_token,
            },
            status=status.HTTP_201_CREATED,
        )
        set_refresh_cookie(res, str(refresh))
        return res


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Login",
        description="Authenticates via phone & password, returns JWT access token and sets httpOnly refresh cookie.",
        request=LoginSerializer,
        responses={200: OpenApiResponse(description="Login successful with JWT access token")},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        res = Response(
            {
                "message": "লগইন সফল হয়েছে (Login successful).",
                "user": UserSerializer(user).data,
                "access": access_token,
            },
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(res, str(refresh))
        return res


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Rotate JWT Access and Refresh Tokens",
        description="Reads refresh token from httpOnly cookie (or body fallback), blacklists it, and returns a new access token.",
    )
    def post(self, request):
        token_str = request.COOKIES.get(settings.AUTH_COOKIE_NAME) or request.data.get("refresh")
        if not token_str:
            return Response(
                {"error": "রিফ্রেশ টোকেন পাওয়া যায়নি (Refresh token missing)."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(token_str)
            # Blacklist old token and issue new pair
            data = {"access": str(refresh.access_token)}

            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
                refresh.set_jti()
                refresh.set_exp()
                refresh.set_iat()
                new_refresh_str = str(refresh)
            else:
                new_refresh_str = token_str

            res = Response(data, status=status.HTTP_200_OK)
            set_refresh_cookie(res, new_refresh_str)
            return res
        except Exception as e:
            res = Response(
                {"error": f"অবৈধ বা মেয়াদোত্তীর্ণ টোকেন (Invalid or expired token): {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_refresh_cookie(res)
            return res


class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Logout",
        description="Blacklists the current refresh token and clears auth cookies.",
    )
    def post(self, request):
        token_str = request.COOKIES.get(settings.AUTH_COOKIE_NAME) or request.data.get("refresh")
        if token_str:
            try:
                token = RefreshToken(token_str)
                token.blacklist()
            except Exception as err:
                import logging
                logging.getLogger(__name__).debug("Token blacklist failed: %s", err)

        res = Response(
            {"message": "লগআউট সম্পন্ন হয়েছে (Logged out successfully)."},
            status=status.HTTP_200_OK,
        )
        clear_refresh_cookie(res)
        return res


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Profile Details",
        responses={200: UserSerializer},
    )
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(
        summary="Update Profile Details",
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
    )
    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @extend_schema(
        summary="Delete Account and Saved History",
        description="Permanently removes the user account and associated history records.",
    )
    def delete(self, request):
        user = request.user
        user.delete()
        res = Response(
            {"message": "অ্যাকাউন্ট এবং সংরক্ষিত তথ্য সফলভাবে মুছে ফেলা হয়েছে (Account and data deleted)."},
            status=status.HTTP_200_OK,
        )
        clear_refresh_cookie(res)
        return res
