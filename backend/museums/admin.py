from django.contrib import admin
from .models import Museum


@admin.register(Museum)
class MuseumAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'ticket_price', 'is_active']
    search_fields = ['name', 'location']
