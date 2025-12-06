from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Vote
from .serializers import VoteSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_votes(request):
    """Get all votes for the current user"""
    votes = Vote.objects.filter(user=request.user)
    vote_dict = {vote.section: vote.vote for vote in votes}
    return Response(vote_dict)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote(request):
    serializer = VoteSerializer(data=request.data)
    if serializer.is_valid():
        vote_obj, created = Vote.objects.update_or_create(
            user=request.user,
            section=serializer.validated_data['section'],
            defaults={'vote': serializer.validated_data['vote']}
        )
        return Response(
            VoteSerializer(vote_obj).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

