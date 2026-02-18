# Test the student ID generation functionality
# You can run this in Django shell: python manage.py shell

# Example of how the student ID generation will work:
"""
from authapp.views import generate_student_id
from django.conf import settings
from datetime import datetime

# This will generate IDs like:
# VSAT2025000001
# VSAT2025000002
# VSAT2025000003
# etc.

student_id1 = generate_student_id()
print(f"Generated Student ID 1: {student_id1}")

student_id2 = generate_student_id()
print(f"Generated Student ID 2: {student_id2}")

# The format is: VSAT + current_year + sequential_number (6 digits)
# - VSAT: Fixed prefix
# - 2025: Current year (will change based on year)
# - 000001: Sequential number starting from 1, padded with zeros
"""
