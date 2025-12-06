from django.urls import path
from .views import vote, get_votes

urlpatterns = [
    path('dashboard/votes/', get_votes, name='get_votes'),
    path('dashboard/vote/', vote, name='vote'),
]

