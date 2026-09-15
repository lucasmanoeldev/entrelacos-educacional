import secrets
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db import transaction, connection, IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes, action, authentication_classes
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.viewsets import ModelViewSet
from .authentication import issue_token, digest
from .models import Profile, Activity, Game, Favorite, AccessToken
from .serializers import ActivitySerializer, PublicActivitySerializer, TEMPLATES
from .games import make_snapshot, current_question, record_answer, result_data, spin_wheel

User = get_user_model()
class AuthThrottle(AnonRateThrottle):
    scope = 'auth'
class AIThrottle(UserRateThrottle):
    scope = 'ai'
class EntryThrottle(AnonRateThrottle):
    scope = 'entry'
class GameThrottle(AnonRateThrottle):
    scope = 'game'
    def get_cache_key(self, request, view):
        # Uma escola pode ter dezenas de jogadores no mesmo IP público.
        token = request.headers.get('X-Game-Token', '')
        identity = digest(token) if token else self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': identity}

def user_data(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return {'id': user.id, 'name': user.first_name, 'email': user.email, 'role': profile.role}

def teacher(user):
    if user_data(user)['role'] == 'STUDENT':
        raise PermissionDenied('A criação de atividades é reservada a professores e escolas.')

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([])
def health(request):
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    return Response({'status': 'ok'})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def register(request):
    class Input(serializers.Serializer):
        name = serializers.CharField(max_length=80)
        email = serializers.EmailField(max_length=150)
        password = serializers.CharField(max_length=128)
        role = serializers.ChoiceField(choices=['TEACHER', 'STUDENT', 'SCHOOL_ADMIN'], default='TEACHER')
    data = Input(data=request.data)
    data.is_valid(raise_exception=True)
    values = data.validated_data
    email = values['email'].lower()
    user = User(username=email, email=email, first_name=values['name'])
    try:
        validate_password(values['password'], user)
    except DjangoValidationError as exc:
        raise ValidationError({'password': exc.messages})
    try:
        with transaction.atomic():
            user.set_password(values['password'])
            user.save()
            Profile.objects.create(user=user, role=values['role'])
    except IntegrityError:
        raise ValidationError('Este e-mail já está cadastrado.')
    return Response({'user': user_data(user), 'token': issue_token(user)}, status=201)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def login(request):
    email = str(request.data.get('email', '')).lower().strip()[:150]
    password = str(request.data.get('password', ''))[:128]
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'E-mail ou senha incorretos.'}, status=400)
    return Response({'user': user_data(user), 'token': issue_token(user)})

@api_view(['GET'])
def me(request):
    return Response(user_data(request.user))

@api_view(['POST'])
def logout(request):
    request.auth.delete()
    return Response(status=204)

@api_view(['POST'])
def refresh(request):
    with transaction.atomic():
        request.auth.delete()
        token = issue_token(request.user)
    return Response({'token': token})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def forgot_password(request):
    user = User.objects.filter(email=str(request.data.get('email', '')).strip().lower()).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f'{settings.FRONTEND_URL}/redefinir-senha/?uid={uid}&token={token}'
        send_mail('Redefina sua senha · Entrelaços', f'Para redefinir sua senha, acesse: {link}', settings.DEFAULT_FROM_EMAIL, [user.email])
    return Response({'detail': 'Se o e-mail estiver cadastrado, enviaremos as instruções.'})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def reset_password(request):
    try:
        user = User.objects.get(pk=urlsafe_base64_decode(request.data.get('uid', '')).decode())
    except (ValueError, TypeError, UnicodeDecodeError, User.DoesNotExist):
        raise ValidationError('Link inválido.')
    if not default_token_generator.check_token(user, request.data.get('token', '')):
        raise ValidationError('Link expirado ou inválido.')
    password = str(request.data.get('password', ''))
    if len(password) > 128:
        raise ValidationError('Senha muito longa.')
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise ValidationError(exc.messages)
    user.set_password(password)
    user.save()
    AccessToken.objects.filter(user=user).delete()
    return Response({'detail': 'Senha atualizada. Entre com sua nova senha.'})

class ActivityViewSet(ModelViewSet):
    serializer_class = ActivitySerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    def get_queryset(self):
        return Activity.objects.filter(creator=self.request.user).prefetch_related('questions__answers').order_by('-updated_at')
    def perform_create(self, serializer):
        teacher(self.request.user)
        serializer.save(creator=self.request.user)
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        activity = self.get_object()
        if not activity.questions.exists():
            raise ValidationError('Adicione perguntas antes de publicar.')
        activity.published = True
        activity.save()
        return Response(self.get_serializer(activity).data)
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        activity = self.get_object()
        activity.published = False
        activity.save()
        return Response(self.get_serializer(activity).data)
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        games = self.get_object().games.filter(finished_at__isnull=False).order_by('-finished_at')
        return Response([result_data(game) for game in games[:500]])

@api_view(['GET'])
@permission_classes([AllowAny])
def explore(request):
    items = Activity.objects.filter(published=True, visibility='public').select_related('creator')
    query = request.query_params.get('q', '')[:100]
    if query:
        items = items.filter(Q(title__icontains=query) | Q(subject__icontains=query))
    for field in ['subject', 'school_year', 'template']:
        if request.query_params.get(field):
            items = items.filter(**{field: request.query_params[field]})
    return Response(PublicActivitySerializer(items.order_by('-updated_at')[:100], many=True).data)

@api_view(['POST'])
def duplicate(request, pk):
    teacher(request.user)
    activity = get_object_or_404(Activity.objects.filter(Q(creator=request.user) | Q(visibility='public', published=True)), pk=pk)
    data = dict(ActivitySerializer(activity).data)
    data.update(title=f'{activity.title[:145]} (cópia)', visibility='link')
    serializer = ActivitySerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save(creator=request.user)
    return Response(serializer.data, status=201)

@api_view(['GET', 'POST', 'DELETE'])
def favorites(request):
    if request.method == 'GET':
        items = Activity.objects.filter(favorite__user=request.user, visibility='public', published=True)
        return Response(PublicActivitySerializer(items, many=True).data)
    activity_id = serializers.UUIDField().run_validation(request.data.get('activity_id'))
    activity = get_object_or_404(Activity, pk=activity_id, visibility='public', published=True)
    if request.method == 'POST':
        Favorite.objects.get_or_create(user=request.user, activity=activity)
    else:
        Favorite.objects.filter(user=request.user, activity=activity).delete()
    return Response(status=204)

def playable(request, code):
    activity = get_object_or_404(Activity, code=code.upper(), published=True)
    if activity.visibility == 'private' and request.user != activity.creator:
        raise PermissionDenied('Esta atividade é privada.')
    return activity

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@throttle_classes([EntryThrottle])
def game_entry(request, code):
    activity = playable(request, code)
    if request.method == 'GET':
        return Response(PublicActivitySerializer(activity).data)
    class Input(serializers.Serializer):
        name = serializers.CharField(max_length=40)
        template = serializers.ChoiceField(choices=TEMPLATES)
    data = Input(data=request.data)
    data.is_valid(raise_exception=True)
    raw = secrets.token_urlsafe(48)
    game = Game.objects.create(activity=activity, token_digest=digest(raw), guest_name=data.validated_data['name'],
                               template=data.validated_data['template'], snapshot=make_snapshot(activity, data.validated_data['template']))
    return Response({'id': str(game.id), 'token': raw, 'question': current_question(game)}, status=201)

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([GameThrottle])
def game_action(request, pk, operation):
    with transaction.atomic():
        game = get_object_or_404(Game.objects.select_for_update(), pk=pk)
        if not secrets.compare_digest(game.token_digest, digest(request.headers.get('X-Game-Token', ''))):
            raise PermissionDenied('Acesso à partida negado.')
        if game.started_at < timezone.now() - timedelta(hours=12):
            raise PermissionDenied('Esta partida expirou. Inicie uma nova.')
        if operation == 'spin' and request.method == 'POST':
            return Response(spin_wheel(game))
        if operation == 'answer' and request.method == 'POST':
            return Response(record_answer(game, request.data))
        if operation == 'reveal' and request.method == 'GET' and game.template == 'flashcards' and not game.finished_at:
            question = game.snapshot[len(game.responses)]
            return Response({'answer': next(a['text'] for a in question['answers'] if a['correct'])})
        if operation == 'result' and request.method == 'GET' and game.finished_at:
            return Response(result_data(game))
        raise ValidationError('Operação indisponível para esta partida.')
