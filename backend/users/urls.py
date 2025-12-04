from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import signup, me, CustomTokenObtainPairView

urlpatterns = [
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', me, name='me'),
]

