from django.db import models
from django.conf import settings


class UserPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    crypto_assets = models.JSONField(default=list)
    investor_type = models.CharField(max_length=100)
    content_preferences = models.JSONField(default=list)

