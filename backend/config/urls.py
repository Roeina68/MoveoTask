"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('onboarding.urls')),
    path('api/', include('dashboard.urls')),
    path('api/', include('feedback.urls')),
]

