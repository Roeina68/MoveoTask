from rest_framework import serializers
from .models import UserPreferences


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['crypto_assets', 'investor_type', 'content_preferences']

