import hashlib
import secrets
from datetime import timedelta
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import AccessToken

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def issue_token(user):
    raw = secrets.token_urlsafe(48)
    AccessToken.objects.filter(user=user, expires_at__lt=timezone.now()).delete()
    AccessToken.objects.create(user=user, digest=digest(raw), expires_at=timezone.now() + timedelta(hours=12))
    return raw

class BearerAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return None
        token = AccessToken.objects.select_related('user').filter(digest=digest(header[7:]), expires_at__gt=timezone.now(), user__is_active=True).first()
        if not token:
            raise AuthenticationFailed('Sua sessão expirou. Entre novamente.')
        return token.user, token
    def authenticate_header(self, request):
        return 'Bearer'
