"""Bounded activity queries: counts do not multiply questions by games."""
from django.db.models import Count, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from .models import Activity, Game, Question


def activity_cards(queryset=None):
    queryset = Activity.objects.all() if queryset is None else queryset
    questions = Question.objects.filter(activity_id=OuterRef('pk')).order_by().values('activity_id').annotate(n=Count('pk')).values('n')
    games = Game.objects.filter(activity_id=OuterRef('pk'), finished_at__isnull=False).order_by().values('activity_id').annotate(n=Count('pk')).values('n')
    return queryset.select_related('creator').annotate(
        question_total=Coalesce(Subquery(questions, output_field=IntegerField()), Value(0)),
        plays_total=Coalesce(Subquery(games, output_field=IntegerField()), Value(0)),
    )
