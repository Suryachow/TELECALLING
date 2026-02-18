from pathlib import Path
from pymongo import MongoClient
import os
from urllib.parse import quote_plus

BASE_DIR = Path(__file__).resolve().parent.parent

# MONGO_URI = os.getenv('MONGO_URI', "mongodb+srv://chari6268:TyS4PZAhKy7m06xK@cluster0.1ldcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
MONGO_URI = os.getenv('MONGO_URI', "mongodb://admin:Vfstr%21%40%23@18.60.148.8:27017/?authSource=admin")
# MONGO_URI = os.getenv('MONGO_URI', "mongodb+srv://vutesting6268_db_user:vI0P5vNLQ9XHAYju@vignan.9qnh6kk.mongodb.net/?retryWrites=true&w=majority&appName=vignan")

MONGO_MAX_POOL = int(os.getenv('MONGO_MAX_POOL', '10'))
MONGO_SERVER_SELECTION_TIMEOUT_MS = int(os.getenv('MONGO_SERVER_SELECTION_TIMEOUT_MS', '5000'))
MONGO_SOCKET_TIMEOUT_MS = int(os.getenv('MONGO_SOCKET_TIMEOUT_MS', '20000'))
MONGO_MAX_IDLE_MS = int(os.getenv('MONGO_MAX_IDLE_MS', '300000'))  # 5 minutes

MONGO_CLIENT = MongoClient(
    MONGO_URI,
    maxPoolSize=MONGO_MAX_POOL,
    serverSelectionTimeoutMS=MONGO_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS=MONGO_SOCKET_TIMEOUT_MS,
    maxIdleTimeMS=MONGO_MAX_IDLE_MS,
)

MONGO_DB = MONGO_CLIENT["user_auth_db"]

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-+ffc1i+a4kad=@=j@f+k60dyk2o25w##whv==@6p)3#_j%9phf')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '.vercel.app', '.vercel.sh', '.neuraltrixai.com']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',  # Add CORS headers support
    'authapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add CORS middleware at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Re-enabled for production
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'user_auth_django.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'user_auth_django.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = []

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:2106",
    "http://localhost:3000",  # React default port
    "http://127.0.0.1:3000",  # React alternative
    "http://localhost:8080",  # Vue.js default port
    "http://127.0.0.1:8080",  # Vue.js alternative
    "http://localhost:4200",  # Angular default port
    "http://127.0.0.1:4200",  # Angular alternative
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",  # Vite alternative
    "https://admissions-ui.vercel.app",
    "https://admissions.neuraltrixai.com"
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.vercel\.sh$",
    r"^https://.*\.neuraltrixai\.com$"
]

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only True when DEBUG=True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_CREDENTIALS = True

CORS_PREFLIGHT_MAX_AGE = 86400

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:2106",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://admissions-ui.vercel.app",
    "https://admissions.neuraltrixai.com",
    "https://*.vercel.app",
    "https://*.vercel.sh",
    "https://*.neuraltrixai.com"
]

if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Vercel handles SSL
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True