import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Booking(models.Model):
    """A ticket booking for a museum visit."""

    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    museum = models.ForeignKey(
        'museums.Museum',
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    ticket_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    num_tickets = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        help_text="Primary person plus up to 3 guests (max 4 tickets total)"
    )
    visitor_names = models.JSONField(default=list, blank=True, help_text="List of names for each ticket")
    visit_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.name} — {self.museum.name} ({self.ticket_id})'
