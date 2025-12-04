from rest_framework import serializers
from .models import Vote


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['section', 'vote']
    
    def validate_vote(self, value):
        if value not in [1, -1]:
            raise serializers.ValidationError("Vote must be 1 or -1")
        return value

