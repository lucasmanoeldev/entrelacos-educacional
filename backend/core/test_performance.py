from django.contrib.auth import get_user_model
from django.db import connection
from django.test import override_settings
from django.test.utils import CaptureQueriesContext
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Activity, Question, Answer, Game, Profile


@override_settings(SECURE_SSL_REDIRECT=False)
class QueryBudgetTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('performance@example.com')
        Profile.objects.create(user=self.user)
        self.client.force_authenticate(self.user)

    def activity(self):
        activity = Activity.objects.create(creator=self.user, title='Teste', published=True, visibility='public')
        question = Question.objects.create(activity=activity, text='Pergunta', position=0)
        Answer.objects.bulk_create([
            Answer(question=question, text='Sim', correct=True, position=0),
            Answer(question=question, text='Não', correct=False, position=1),
        ])
        return activity

    def get_with_budget(self, path, maximum):
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(queries), maximum, [q['sql'] for q in queries])
        return response

    def test_twenty_cards_use_one_query_and_omit_answers(self):
        for _ in range(20):
            self.activity()
        for path in ['/api/v1/activities/?summary=1', '/api/v1/explore/']:
            response = self.get_with_budget(path, 1)
            self.assertEqual(len(response.data), 20)
            self.assertEqual(response.data[0]['question_count'], 1)
            self.assertNotIn('questions', response.data[0])
            self.assertNotIn('correct', response.data[0])

    def test_report_does_not_query_ranking_for_each_participant(self):
        activity = self.activity()
        Game.objects.bulk_create([
            Game(activity=activity, token_digest='x', guest_name='Aluno', template='quiz',
                 snapshot=[{'id': 'question'}], responses=[], finished_at=timezone.now())
            for _ in range(30)
        ])
        response = self.get_with_budget(f'/api/v1/activities/{activity.pk}/results/', 2)
        self.assertEqual(len(response.data), 30)
        self.assertEqual(response.data[0]['ranking'], [])

    def test_summary_remains_scoped_to_owner(self):
        self.activity()
        other = get_user_model().objects.create_user('other@example.com')
        Activity.objects.create(creator=other, title='Segredo', published=False)
        response = self.get_with_budget('/api/v1/activities/?summary=1', 1)
        self.assertEqual(len(response.data), 1)
        self.assertNotEqual(response.data[0]['title'], 'Segredo')
