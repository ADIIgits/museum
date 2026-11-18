from django.db import models
from django.conf import settings


class Museum(models.Model):
    """A museum listing with ticket pricing managed by an operator."""

    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_museums',
        null=True,
        blank=True,
        help_text='The operator/admin who created this museum'
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=300)
    image = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text='URL to museum cover image',
    )
    ticket_price = models.DecimalField(max_digits=8, decimal_places=2)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
