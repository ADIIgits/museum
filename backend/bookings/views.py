import uuid
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer
from .payment_services import get_payment_gateway


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to users with role='admin' or staff status."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, 'role', '') == 'admin' or request.user.is_staff)
        )


class BookingCreateView(generics.CreateAPIView):
    """POST /api/bookings/  — create a new booking."""
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingListView(generics.ListAPIView):
    """GET /api/bookings/  — list current user's bookings (tickets)."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class BookingDetailView(generics.RetrieveAPIView):
    """GET /api/bookings/<id>/  — single booking/ticket detail."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def simulate_payment(request, pk):
    """
    POST /api/bookings/<id>/pay/
    Processes payment via modular sandbox gateway (Payate / Visatk).
    Confirms booking upon success.
    """
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

    if booking.status == 'confirmed':
        return Response({'detail': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)

    # Process via modular payment gateway
    gateway = get_payment_gateway()
    payment_result = gateway.process_payment(
        amount=float(booking.total_price),
        currency='INR',
        payment_details=request.data or {}
    )

    if not payment_result.get('success'):
        return Response(
            {
                'detail': payment_result.get('message', 'Payment was declined by gateway.'),
                'gateway': payment_result.get('gateway'),
                'transaction_id': payment_result.get('transaction_id')
            },
            status=status.HTTP_402_PAYMENT_REQUIRED
        )

    # Success: confirm booking and record transaction reference
    booking.status = 'confirmed'
    booking.payment_id = payment_result.get('transaction_id')
    booking.save()

    serializer = BookingSerializer(booking)
    return Response(serializer.data)


class AdminBookingListView(generics.ListAPIView):
    """
    GET /api/bookings/admin/all/
    Admin-only endpoint to list and search bookings for museums managed by this operator.
    Supports query parameter ?search= and ?date=
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        user = self.request.user
        # An operator sees bookings for museums they manage (or all if superuser)
        if user.is_superuser:
            queryset = Booking.objects.select_related('user', 'museum').all()
        else:
            queryset = Booking.objects.select_related('user', 'museum').filter(museum__operator=user)

        queryset = queryset.order_by('-created_at')

        search_query = self.request.query_params.get('search', '').strip()
        date_query = self.request.query_params.get('date', '').strip()
        museum_id = self.request.query_params.get('museum', '').strip()

        if museum_id:
            queryset = queryset.filter(museum_id=museum_id)

        if search_query:
            q = (
                Q(user__name__icontains=search_query)
                | Q(user__email__icontains=search_query)
                | Q(museum__name__icontains=search_query)
                | Q(ticket_id__icontains=search_query)
                | Q(visitor_names__icontains=search_query)
            )
            if '-' in search_query:
                q |= Q(visit_date__icontains=search_query)
            queryset = queryset.filter(q)

        if date_query:
            queryset = queryset.filter(visit_date=date_query)

        return queryset
