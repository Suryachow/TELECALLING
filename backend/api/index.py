import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_auth_django.settings')

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
