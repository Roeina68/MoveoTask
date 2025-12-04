from django.db import models
from django.conf import settings


class Vote(models.Model):
    SECTION_CHOICES = [
        ("news", "News"),
        ("prices", "Prices"),
        ("ai", "AI"),
        ("meme", "Meme"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    section = models.CharField(max_length=20, choices=SECTION_CHOICES)
    vote = models.IntegerField()  # 1 or -1
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'section']

