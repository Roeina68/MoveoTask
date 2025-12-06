from django.urls import path
from .views import news, prices, ai_insight, meme, price_history, price_history_all

urlpatterns = [
    path('dashboard/news/', news, name='news'),
    path('dashboard/prices/', prices, name='prices'),
    path('dashboard/price-history/', price_history, name='price-history'),
    path('dashboard/price-history-all/', price_history_all, name='price-history-all'),
    path('dashboard/ai-insight/', ai_insight, name='ai-insight'),
    path('dashboard/meme/', meme, name='meme'),
]

