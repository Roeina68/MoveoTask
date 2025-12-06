from django.urls import path
from .views import onboarding, get_preferences, update_preferences

urlpatterns = [
    path('onboarding/', onboarding, name='onboarding'),
    path('preferences/', get_preferences, name='get_preferences'),
    path('preferences/update/', update_preferences, name='update_preferences'),
]

