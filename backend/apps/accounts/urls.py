from django.urls import path, re_path

from .views import LoginView, LogoutView, RefreshTokenView, RegisterView

urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view(), name="auth-register"),
    re_path(r"^login/?$", LoginView.as_view(), name="auth-login"),
    re_path(r"^refresh/?$", RefreshTokenView.as_view(), name="auth-refresh"),
    re_path(r"^logout/?$", LogoutView.as_view(), name="auth-logout"),
]
