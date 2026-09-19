import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', '')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'development-only-do-not-use-in-production'
    else:
        raise RuntimeError('Defina SECRET_KEY no ambiente.')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver' if DEBUG else '').split(',')
if os.getenv('RENDER_EXTERNAL_HOSTNAME'):
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_HOSTNAME'])
INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes',
                  'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles',
                  'rest_framework', 'corsheaders', 'core']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware', 'whitenoise.middleware.WhiteNoiseMiddleware',
              'corsheaders.middleware.CorsMiddleware', 'django.contrib.sessions.middleware.SessionMiddleware',
              'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware',
              'django.contrib.auth.middleware.AuthenticationMiddleware', 'django.contrib.messages.middleware.MessageMiddleware',
              'django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True,
              'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                         'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
DATABASES = {'default': dj_database_url.config(default=f'sqlite:///{BASE_DIR / "db.sqlite3"}', conn_max_age=60)}
DATABASES['default']['CONN_HEALTH_CHECKS'] = True
ALLOW_SQLITE = os.getenv('ALLOW_SQLITE', 'false').lower() == 'true'
if not DEBUG and DATABASES['default']['ENGINE'].endswith('sqlite3') and not ALLOW_SQLITE:
    raise RuntimeError('Defina DATABASE_URL PostgreSQL ou ALLOW_SQLITE=true para teste temporário.')
if DATABASES['default']['ENGINE'].endswith('sqlite3'):
    DATABASES['default']['OPTIONS'] = {'timeout': 20}
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 10}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Fortaleza'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
            'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'}}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', FRONTEND_URL).split(',')
CORS_ALLOW_HEADERS = (*default_headers, 'x-game-token')
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['core.authentication.BearerAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle', 'rest_framework.throttling.UserRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '120/hour', 'user': '1200/hour', 'auth': '15/hour', 'ai': '20/hour', 'game': '600/hour', 'entry': '1200/hour'},
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'EXCEPTION_HANDLER': 'core.errors.exception_handler',
}
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'true').lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'false').lower() == 'true'
EMAIL_TIMEOUT = 20
if EMAIL_USE_TLS and EMAIL_USE_SSL:
    raise RuntimeError('SMTP: escolha EMAIL_USE_TLS ou EMAIL_USE_SSL, não os dois.')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'nao-responda@example.com')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b')
