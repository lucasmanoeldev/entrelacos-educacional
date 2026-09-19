from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import serializers
from .views import AIThrottle, teacher
from .serializers import ActivitySerializer
from .models import AIGeneration
from .ai_provider import generate_draft, GenerationError

@api_view(['POST'])
@throttle_classes([AIThrottle])
def generate(request):
    teacher(request.user)
    class Input(serializers.Serializer):
        topic = serializers.CharField(max_length=300)
        subject = serializers.CharField(max_length=60)
        school_year = serializers.CharField(max_length=30)
        count = serializers.IntegerField(min_value=1)
        offset = serializers.IntegerField(min_value=0, default=0)
        difficulty = serializers.ChoiceField(choices=['Fácil', 'Média', 'Difícil'])
    form = Input(data=request.data)
    form.is_valid(raise_exception=True)
    try:
        data = generate_draft(form.validated_data)
        data.update(subject=form.validated_data['subject'], school_year=form.validated_data['school_year'], template='quiz', visibility='link')
        activity = ActivitySerializer(data=data)
        if not activity.is_valid() or len(data.get('questions', [])) != form.validated_data['count']:
            return Response({'error': 'A IA retornou conteúdo incompleto. Tente novamente.'}, status=502)
    except GenerationError as exc:
        return Response({'error': str(exc)}, status=exc.status)
    AIGeneration.objects.create(user=request.user, topic=form.validated_data['topic'])
    return Response(activity.validated_data)
