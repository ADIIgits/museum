"""
Management command to seed 3 dummy museums.
Run: python manage.py seed_museums
"""

from django.core.management.base import BaseCommand
from museums.models import Museum


MUSEUMS = [
    {
        'name': 'National Museum of Art & Heritage',
        'description': (
            'Explore centuries of artistic brilliance across 40+ galleries. '
            'From ancient sculptures to contemporary masterpieces, this museum '
            'houses over 10,000 works spanning diverse cultures and eras. '
            'Highlights include the Renaissance Wing, the Modern Art Pavilion, '
            'and the immersive Digital Art Experience.'
        ),
        'location': 'Rajpath, Central Delhi, New Delhi 110001',
        'image': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
        'ticket_price': 250.00,
        'opening_time': '09:00',
        'closing_time': '18:00',
    },
    {
        'name': 'Science Discovery Centre',
        'description': (
            'A hands-on science museum perfect for curious minds of all ages. '
            'Featuring interactive exhibits on space exploration, robotics, '
            'quantum physics, and the human body. Don\'t miss the 4D planetarium '
            'show and the live chemistry demonstration lab.'
        ),
        'location': 'Pragati Maidan, Mathura Road, New Delhi 110001',
        'image': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
        'ticket_price': 350.00,
        'opening_time': '10:00',
        'closing_time': '19:00',
    },
    {
        'name': 'Maritime History Museum',
        'description': (
            'Dive into India\'s rich maritime past at this waterfront museum. '
            'Discover ancient trade routes, shipbuilding techniques, and naval '
            'warfare history. The museum features life-size ship replicas, '
            'rare navigational instruments, and an underwater archaeology exhibit.'
        ),
        'location': 'Marine Drive, Mumbai, Maharashtra 400020',
        'image': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80',
        'ticket_price': 300.00,
        'opening_time': '09:30',
        'closing_time': '17:30',
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with 3 dummy museums'

    def handle(self, *args, **options):
        for data in MUSEUMS:
            museum, created = Museum.objects.get_or_create(
                name=data['name'],
                defaults=data,
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  {status}: {museum.name}')

        self.stdout.write(self.style.SUCCESS('\nDone — 3 museums seeded.'))
