from django.urls import path
from .views import news, prices, ai_insight, meme

urlpatterns = [
    path('dashboard/news/', news, name='news'),
    path('dashboard/prices/', prices, name='prices'),
    path('dashboard/ai-insight/', ai_insight, name='ai-insight'),
    path('dashboard/meme/', meme, name='meme'),
]

