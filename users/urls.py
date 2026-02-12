from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CsrfTokenView,
    EmailOrUsernameTokenView,
    MeView,
    RegisterView,
    SessionLoginView,
    SessionLogoutView,
)

urlpatterns = [
    path("csrf/", CsrfTokenView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", SessionLoginView.as_view()),
    path("logout/", SessionLogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("jwt/create/", EmailOrUsernameTokenView.as_view()),
    path("jwt/refresh/", TokenRefreshView.as_view()),
    path("jwt/verify/", TokenVerifyView.as_view()),
]
