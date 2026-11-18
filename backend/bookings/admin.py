from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['ticket_id', 'user', 'museum', 'visit_date', 'status', 'total_price']
    list_filter = ['status']
    search_fields = ['ticket_id', 'user__name', 'museum__name']
