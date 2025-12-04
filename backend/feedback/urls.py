from django.urls import path
from .views import vote

urlpatterns = [
    path('dashboard/vote/', vote, name='vote'),
]

