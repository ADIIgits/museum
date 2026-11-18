from rest_framework import serializers
from .models import Booking
from museums.serializers import MuseumSerializer
from accounts.serializers import UserSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new booking."""
    num_tickets = serializers.IntegerField(min_value=1, max_value=4)

    class Meta:
        model = Booking
        fields = ['id', 'museum', 'num_tickets', 'visit_date', 'visitor_names']

    def validate(self, attrs):
        num_tickets = attrs.get('num_tickets', 1)
        if num_tickets > 4:
            raise serializers.ValidationError(
                {'num_tickets': 'You can book a maximum of 4 tickets (yourself + up to 3 guests).'}
            )
        visitor_names = attrs.get('visitor_names', [])
        if len(visitor_names) != num_tickets:
            raise serializers.ValidationError(
                {'visitor_names': f'Please provide exactly {num_tickets} visitor names.'}
            )
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        museum = validated_data['museum']
        num_tickets = validated_data['num_tickets']
        visitor_names = validated_data.get('visitor_names', [])
        total_price = museum.ticket_price * num_tickets

        booking = Booking.objects.create(
            user=user,
            museum=museum,
            num_tickets=num_tickets,
            visit_date=validated_data['visit_date'],
            visitor_names=visitor_names,
            total_price=total_price,
            status='pending',
        )
        return booking


class BookingSerializer(serializers.ModelSerializer):
    """Full booking detail including nested museum info and booked-by user info."""
    museum = MuseumSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'ticket_id', 'user', 'museum', 'num_tickets', 'visitor_names', 'visit_date',
            'total_price', 'status', 'payment_id', 'created_at',
        ]
