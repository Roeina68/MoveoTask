from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserPreferences
from .serializers import UserPreferencesSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboarding(request):
    serializer = UserPreferencesSerializer(data=request.data)
    if serializer.is_valid():
        preferences, created = UserPreferences.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data
        )
        # Mark user as having completed onboarding
        request.user.has_completed_onboarding = True
        request.user.save()
        return Response(
            UserPreferencesSerializer(preferences).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

