import secrets
import uuid
from django.conf import settings
from django.db import models

def code():
    return secrets.token_hex(4).upper()

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[('TEACHER', 'Professor'), ('STUDENT', 'Aluno'), ('SCHOOL_ADMIN', 'Escola')], default='TEACHER')

class AccessToken(models.Model):
    digest = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()

class Activity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True, max_length=2000)
    subject = models.CharField(max_length=60, default='Ciências')
    school_year = models.CharField(max_length=30, default='6º ano')
    language = models.CharField(max_length=10, default='pt-BR')
    template = models.CharField(max_length=20, default='quiz')
    visibility = models.CharField(max_length=10, choices=[('public', 'Pública'), ('link', 'Com link'), ('private', 'Privada')], default='link')
    published = models.BooleanField(default=False)
    code = models.CharField(max_length=8, unique=True, default=code)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=1000)
    explanation = models.CharField(max_length=1500, blank=True)
    position = models.PositiveIntegerField()
    class Meta:
        ordering = ['position']

class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=500)
    correct = models.BooleanField(default=False)
    position = models.PositiveIntegerField()
    class Meta:
        ordering = ['position']

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='games')
    token_digest = models.CharField(max_length=64)
    guest_name = models.CharField(max_length=40)
    template = models.CharField(max_length=20)
    snapshot = models.JSONField()
    responses = models.JSONField(default=list)
    score = models.PositiveIntegerField(default=0)
    correct = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'activity'], name='unique_favorite')]

class AIGeneration(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    topic = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
