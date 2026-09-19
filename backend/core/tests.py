from unittest.mock import patch
from django.test import override_settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase, APIClient
from .models import Game

@override_settings(SECURE_SSL_REDIRECT=False, EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PlatformTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.password = 'Segura!descoberta2026'
        self.user = get_user_model().objects.create_user('prof@example.com', 'prof@example.com', self.password, first_name='Professora')
        login = self.client.post('/api/v1/auth/login/', {'email': 'prof@example.com', 'password': self.password}, format='json')
        self.token = login.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.payload = {'title': 'Sistema Solar', 'description': 'Vamos explorar', 'subject': 'Ciências', 'school_year': '6º ano',
            'template': 'quiz', 'visibility': 'public', 'questions': [
                {'text': 'Qual é o maior planeta?', 'explanation': 'Júpiter é o maior planeta do Sistema Solar.', 'answers': [
                    {'text': 'Júpiter', 'correct': True}, {'text': 'Terra', 'correct': False}]},
                {'text': 'Qual é o planeta vermelho?', 'explanation': 'Marte tem superfície rica em óxido de ferro.', 'answers': [
                    {'text': 'Marte', 'correct': True}, {'text': 'Vênus', 'correct': False}]}]}
        result = self.client.post('/api/v1/activities/', self.payload, format='json')
        self.assertEqual(result.status_code, 201, result.data)
        self.activity = result.data
        self.id = self.activity['id']
        self.code = self.activity['code']
        self.guest = APIClient()
    def publish(self):
        return self.client.post(f'/api/v1/activities/{self.id}/publish/')
    def join(self, template='quiz'):
        self.publish()
        response = self.guest.post(f'/api/v1/games/{self.code}/', {'name': 'Explorador', 'template': template}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        return response.data
    def answer(self, session, question, **payload):
        return self.guest.post(f'/api/v1/game-sessions/{session["id"]}/answer/', {'question_id': question['id'], **payload}, format='json', HTTP_X_GAME_TOKEN=session['token'])
    def test_end_to_end_quiz_and_teacher_report(self):
        session = self.join()
        question = session['question']
        for correct_text in ['Júpiter', 'Marte']:
            answer_id = next(a['id'] for a in question['answers'] if a['text'] == correct_text)
            response = self.answer(session, question, answer_id=answer_id)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.data['correct'])
            question = response.data['next']
        result = self.guest.get(f'/api/v1/game-sessions/{session["id"]}/result/', HTTP_X_GAME_TOKEN=session['token'])
        self.assertEqual(result.data['percentage'], 100)
        self.assertEqual(result.data['correct'], 2)
        self.assertTrue(result.data['ranking'])
        report = self.client.get(f'/api/v1/activities/{self.id}/results/')
        self.assertEqual(len(report.data), 1)
        self.assertEqual(report.data[0]['id'], session['id'])
    def test_register_hash_and_duplicate_email(self):
        data = {'name': 'Maria', 'email': 'Maria@example.com', 'password': self.password}
        response = self.guest.post('/api/v1/auth/register/', data, format='json')
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email='maria@example.com')
        self.assertNotEqual(user.password, self.password)
        self.assertTrue(user.check_password(self.password))
        self.assertEqual(self.guest.post('/api/v1/auth/register/', data, format='json').status_code, 400)
    def test_weak_password_rejected(self):
        response = self.guest.post('/api/v1/auth/register/', {'name': 'Aluno', 'email': 'a@example.com', 'password': '123456'}, format='json')
        self.assertEqual(response.status_code, 400)
    def test_student_cannot_create(self):
        r = self.guest.post('/api/v1/auth/register/', {'name': 'Aluno', 'email': 'aluno@example.com', 'password': self.password, 'role': 'STUDENT'}, format='json')
        self.guest.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["token"]}')
        self.assertEqual(self.guest.post('/api/v1/activities/', self.payload, format='json').status_code, 403)
    def test_admin_role_cannot_be_self_assigned(self):
        self.assertEqual(self.guest.post('/api/v1/auth/register/', {'name': 'X', 'email': 'x@example.com', 'password': self.password, 'role': 'ADMIN'}, format='json').status_code, 400)
    def test_logout_revokes_token(self):
        self.assertEqual(self.client.post('/api/v1/auth/logout/').status_code, 204)
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code, 401)
    def test_refresh_rotates_token(self):
        response = self.client.post('/api/v1/auth/refresh/')
        self.assertNotEqual(response.data['token'], self.token)
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code, 401)
    def test_ownership_isolation(self):
        other = get_user_model().objects.create_user('outro@example.com', password=self.password)
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get(f'/api/v1/activities/{self.id}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/v1/activities/{self.id}/results/').status_code, 404)
        self.assertEqual(self.client.delete(f'/api/v1/activities/{self.id}/').status_code, 404)
    def test_draft_not_playable_or_listed(self):
        self.assertEqual(self.guest.get(f'/api/v1/games/{self.code}/').status_code, 404)
        self.assertEqual(self.guest.get('/api/v1/explore/').data, [])
    def test_private_not_playable(self):
        self.client.patch(f'/api/v1/activities/{self.id}/', {'visibility': 'private'}, format='json')
        self.publish()
        self.assertEqual(self.guest.get(f'/api/v1/games/{self.code}/').status_code, 403)
        self.assertEqual(self.guest.get('/api/v1/explore/').data, [])
    def test_public_payload_does_not_leak_answers(self):
        session = self.join()
        self.assertNotIn('correct', str(session))
        self.assertNotIn('explanation', session['question'])
        self.assertNotIn('questions', self.guest.get(f'/api/v1/games/{self.code}/').data)
    def test_duplicate_answer_cannot_score_twice(self):
        s = self.join(); q = s['question']; answer = q['answers'][0]['id']
        self.assertEqual(self.answer(s, q, answer_id=answer).status_code, 200)
        self.assertEqual(self.answer(s, q, answer_id=answer).status_code, 400)
        self.assertEqual(len(Game.objects.get(pk=s['id']).responses), 1)
    def test_game_token_required(self):
        s = self.join()
        response = self.guest.post(f'/api/v1/game-sessions/{s["id"]}/answer/', {}, format='json')
        self.assertEqual(response.status_code, 403)
    def test_invalid_answers_rejected(self):
        self.payload['questions'][0]['answers'][1]['correct'] = True
        self.assertEqual(self.client.post('/api/v1/activities/', self.payload, format='json').status_code, 400)
    def test_snapshot_survives_edit(self):
        s = self.join()
        self.payload['questions'][0]['text'] = 'Pergunta alterada'
        self.client.put(f'/api/v1/activities/{self.id}/', self.payload, format='json')
        self.assertEqual(self.answer(s, s['question'], answer_id=s['question']['answers'][0]['id']).status_code, 200)
    def test_other_templates(self):
        for template in ['true-false', 'flashcards', 'match']:
            s = self.join(template)
            q = s['question']
            while q:
                source = Game.objects.get(pk=s['id']).snapshot[q['index']]
                if template == 'true-false':
                    payload = {'value': source['truth']}
                elif template == 'flashcards':
                    reveal = self.guest.get(f'/api/v1/game-sessions/{s["id"]}/reveal/', HTTP_X_GAME_TOKEN=s['token'])
                    self.assertEqual(reveal.status_code, 200)
                    payload = {'learned': True}
                else:
                    payload = {'answer_id': next(a['id'] for a in source['answers'] if a['correct'])}
                response = self.answer(s, q, **payload)
                self.assertEqual(response.status_code, 200, response.data)
                self.assertTrue(response.data['correct'])
                q = response.data['next']
            result = self.guest.get(f'/api/v1/game-sessions/{s["id"]}/result/', HTTP_X_GAME_TOKEN=s['token'])
            self.assertEqual(result.data['percentage'], 100)
            if template == 'flashcards':
                self.assertEqual(result.data['ranking'], [])
                self.assertEqual(result.data['score'], 0)
    def test_duplicate_is_private_draft(self):
        self.publish()
        response = self.client.post(f'/api/v1/activities/{self.id}/duplicate/')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data['published'])
        self.assertEqual(response.data['visibility'], 'link')
        self.assertNotEqual(response.data['code'], self.code)
        self.assertEqual(len(response.data['questions']), 2)
    def test_ai_without_key_is_explicit(self):
        with override_settings(GROQ_API_KEY=''):
            response = self.client.post('/api/v1/ai/generate-activity/', {'topic': 'Planetas', 'subject': 'Ciências', 'school_year': '6º ano', 'count': 2, 'difficulty': 'Média'}, format='json')
        self.assertEqual(response.status_code, 503)
    def test_cors_allows_game_token(self):
        response = self.guest.options('/api/v1/health/', HTTP_ORIGIN='http://localhost:3000', HTTP_ACCESS_CONTROL_REQUEST_METHOD='GET', HTTP_ACCESS_CONTROL_REQUEST_HEADERS='x-game-token')
        self.assertIn('x-game-token', response['Access-Control-Allow-Headers'])

    def test_password_reset_delivers_one_use_link_and_revokes_sessions(self):
        from django.core import mail
        from urllib.parse import urlparse, parse_qs
        response = self.guest.post('/api/v1/auth/forgot-password/', {'email': self.user.email}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        link = mail.outbox[0].body.split()[-1]
        query = parse_qs(urlparse(link).query)
        data = {'uid': query['uid'][0], 'token': query['token'][0], 'password': 'Senha!renovada2026'}
        self.assertEqual(self.guest.post('/api/v1/auth/reset-password/', data, format='json').status_code, 200)
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code, 401)
        self.assertEqual(self.guest.post('/api/v1/auth/reset-password/', data, format='json').status_code, 400)

    @override_settings(GROQ_API_KEY='test-key')
    @patch('core.ai_provider.httpx.post')
    def test_ai_returns_validated_draft_without_publishing(self, mock_post):
        import json
        mock_post.return_value.json.return_value = {'choices': [{'message': {'content': json.dumps(self.payload)}}]}
        response = self.client.post('/api/v1/ai/generate-activity/', {'topic': 'Planetas', 'subject': 'Ciências', 'school_year': '6º ano', 'count': 2, 'difficulty': 'Média'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(response.data['questions']), 2)
        self.assertEqual(self.user.activities.count(), 1)

    @override_settings(GROQ_API_KEY='test-key')
    @patch('core.ai_provider.httpx.post')
    def test_ai_invalid_content_is_rejected(self, mock_post):
        mock_post.return_value.json.return_value = {'choices': [{'message': {'content': '{"questions": []}'}}]}
        response = self.client.post('/api/v1/ai/generate-activity/', {'topic': 'Planetas', 'subject': 'Ciências', 'school_year': '6º ano', 'count': 2, 'difficulty': 'Média'}, format='json')
        self.assertEqual(response.status_code, 502)

    def test_favorites_validation_and_removal(self):
        self.publish()
        self.assertEqual(self.client.post('/api/v1/favorites/', {'activity_id': 'invalid'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/v1/favorites/', {'activity_id': self.id}, format='json').status_code, 204)
        self.assertEqual(len(self.client.get('/api/v1/favorites/').data), 1)
        self.assertEqual(self.client.delete('/api/v1/favorites/', {'activity_id': self.id}, format='json').status_code, 204)
        self.assertEqual(self.client.get('/api/v1/favorites/').data, [])

    def test_roulette_requires_spin_and_never_repeats_questions(self):
        session = self.join('roulette')
        pending = session['question']
        self.assertEqual(pending['text'], '')
        self.assertNotIn('answers', pending)
        self.assertEqual(self.answer(session, pending, answer_id='invalid').status_code, 400)
        seen = []
        while pending:
            path = f'/api/v1/game-sessions/{session["id"]}/spin/'
            drawn = self.guest.post(path, {}, format='json', HTTP_X_GAME_TOKEN=session['token'])
            self.assertEqual(drawn.status_code, 200)
            question = drawn.data
            self.assertTrue(question['spun'])
            self.assertNotIn(question['wheel_number'], seen)
            self.assertIn(question['wheel_number'], pending['wheel_slots'])
            seen.append(question['wheel_number'])
            repeated = self.guest.post(path, {}, format='json', HTTP_X_GAME_TOKEN=session['token'])
            self.assertEqual(repeated.data, question)
            source = Game.objects.get(pk=session['id']).snapshot[len(seen) - 1]
            answer_id = next(a['id'] for a in source['answers'] if a['correct'])
            answer = self.answer(session, question, answer_id=answer_id)
            self.assertTrue(answer.data['correct'])
            pending = answer.data['next']
        self.assertEqual(sorted(seen), [1, 2])
        result = self.guest.get(f'/api/v1/game-sessions/{session["id"]}/result/', HTTP_X_GAME_TOKEN=session['token'])
        self.assertEqual(result.data['percentage'], 100)
        self.assertEqual(result.data['template'], 'roulette')
        self.assertTrue(result.data['ranking'])
        self.assertEqual(self.guest.post(path, {}, format='json', HTTP_X_GAME_TOKEN=session['token']).status_code, 400)

    def test_roulette_can_be_saved_as_activity_template(self):
        self.payload['template'] = 'roulette'
        response = self.client.post('/api/v1/activities/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['template'], 'roulette')

    @patch('rest_framework.throttling.AnonRateThrottle.allow_request', return_value=False)
    def test_health_check_is_not_rate_limited(self, throttle):
        response = self.guest.get('/api/v1/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'status': 'ok'})
        throttle.assert_not_called()
