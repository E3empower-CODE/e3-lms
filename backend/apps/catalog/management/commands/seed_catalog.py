from decimal import Decimal

from catalog.models import Course, CourseCategory
from django.core.management.base import BaseCommand

CATALOG = {
    "Software Development": [
        ("Python 3 Beginner", "50000.00", "8 weeks"),
        ("Web Development Basics", "60000.00", "10 weeks"),
        ("JavaScript Essentials", "55000.00", "8 weeks"),
    ],
    "Data & Analytics": [
        ("Data Analysis with Excel", "40000.00", "6 weeks"),
        ("Intro to SQL", "45000.00", "6 weeks"),
    ],
    "Design": [
        ("UI/UX Fundamentals", "50000.00", "8 weeks"),
    ],
}


class Command(BaseCommand):
    help = "Seed demo course categories and courses (idempotent)."

    def handle(self, *args, **options):
        created = 0
        for category_name, courses in CATALOG.items():
            category, _ = CourseCategory.objects.get_or_create(name=category_name)
            for name, fee, duration in courses:
                _, was_created = Course.objects.get_or_create(
                    category=category,
                    name=name,
                    defaults={
                        "fee": Decimal(fee),
                        "duration_label": duration,
                        "active": True,
                    },
                )
                created += int(was_created)
        self.stdout.write(
            self.style.SUCCESS(f"Catalog seeded ({created} new course(s)).")
        )
