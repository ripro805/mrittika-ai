from rest_framework.permissions import BasePermission

from .models import User


class IsFarmer(BasePermission):
    """Allows access to farmers and administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in [User.Role.FARMER, User.Role.ADMIN] or request.user.is_staff)
        )


class IsVerifiedOfficer(BasePermission):
    """Allows access to extension officers verified by an admin, or admins."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                (request.user.role == User.Role.OFFICER and request.user.is_verified)
                or request.user.role == User.Role.ADMIN
                or request.user.is_staff
            )
        )


class IsAdminRole(BasePermission):
    """Allows access only to administrator users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )
