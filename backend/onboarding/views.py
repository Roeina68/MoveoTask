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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_preferences(request):
    """Get current user preferences"""
    try:
        preferences = UserPreferences.objects.get(user=request.user)
        return Response(UserPreferencesSerializer(preferences).data)
    except UserPreferences.DoesNotExist:
        return Response({
            'crypto_assets': [],
            'investor_type': '',
            'content_preferences': []
        })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_preferences(request):
    """Update user preferences"""
    try:
        preferences = UserPreferences.objects.get(user=request.user)
        serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except UserPreferences.DoesNotExist:
        # If preferences don't exist, create them
        serializer = UserPreferencesSerializer(data=request.data)
        if serializer.is_valid():
            preferences = serializer.save(user=request.user)
            return Response(UserPreferencesSerializer(preferences).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
