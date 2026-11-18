from rest_framework import serializers
from .models import Museum
from accounts.serializers import UserSerializer


class MuseumSerializer(serializers.ModelSerializer):
    operator = UserSerializer(read_only=True)

    class Meta:
        model = Museum
        fields = [
            'id', 'operator', 'name', 'description', 'location', 'image',
            'ticket_price', 'opening_time', 'closing_time', 'is_active',
        ]
        read_only_fields = ['id', 'operator', 'is_active']
