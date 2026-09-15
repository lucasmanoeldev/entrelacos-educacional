from django.db import transaction
from rest_framework import serializers
from .models import Activity, Question, Answer

TEMPLATES = ['quiz', 'true-false', 'flashcards', 'match', 'roulette']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'explanation', 'answers']
    def validate_answers(self, answers):
        if not 2 <= len(answers) <= 6 or sum(a['correct'] for a in answers) != 1:
            raise serializers.ValidationError('Use de 2 a 6 respostas, com exatamente uma correta.')
        if len({a['text'].strip().casefold() for a in answers}) != len(answers):
            raise serializers.ValidationError('As alternativas devem ser diferentes.')
        return answers

class ActivitySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    creator_name = serializers.CharField(source='creator.first_name', read_only=True)
    plays = serializers.SerializerMethodField()
    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'subject', 'school_year', 'language', 'template', 'visibility', 'published', 'code', 'questions', 'creator_name', 'plays', 'updated_at']
        read_only_fields = ['code', 'published']
    def get_plays(self, obj):
        return obj.games.filter(finished_at__isnull=False).count()
    def validate_template(self, value):
        if value not in TEMPLATES:
            raise serializers.ValidationError('Formato inválido.')
        return value
    def validate_questions(self, value):
        if not 1 <= len(value) <= 50:
            raise serializers.ValidationError('Inclua entre 1 e 50 perguntas.')
        return value
    def save_questions(self, activity, questions):
        for position, item in enumerate(questions):
            answers = item.pop('answers')
            question = Question.objects.create(activity=activity, position=position, **item)
            Answer.objects.bulk_create([Answer(question=question, position=i, **answer) for i, answer in enumerate(answers)])
    @transaction.atomic
    def create(self, data):
        questions = data.pop('questions')
        activity = Activity.objects.create(**data)
        self.save_questions(activity, questions)
        return activity
    @transaction.atomic
    def update(self, instance, data):
        questions = data.pop('questions', None)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        if questions is not None:
            instance.questions.all().delete()
            self.save_questions(instance, questions)
        return instance

class PublicActivitySerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.first_name')
    question_count = serializers.SerializerMethodField()
    plays = serializers.SerializerMethodField()
    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'subject', 'school_year', 'template', 'code', 'creator_name', 'question_count', 'plays']
    def get_question_count(self, obj):
        return obj.questions.count()
    def get_plays(self, obj):
        return obj.games.filter(finished_at__isnull=False).count()
