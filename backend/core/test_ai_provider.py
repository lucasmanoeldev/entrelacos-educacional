import json
from unittest.mock import patch
import httpx
from django.test import SimpleTestCase, override_settings
from .ai_provider import generate_draft, GenerationError, NVIDIA_ENDPOINT


@override_settings(NVIDIA_API_KEY='test-secret', NVIDIA_MODEL='deepseek-ai/deepseek-v4-flash-0731')
class NVIDIAProviderTests(SimpleTestCase):
    parameters = {'topic': 'Sistema Solar', 'count': 2, 'subject': 'Ciências', 'school_year': '6º ano', 'difficulty': 'Média'}

    def reply(self, content, finish='stop'):
        return httpx.Response(200, request=httpx.Request('POST', NVIDIA_ENDPOINT), json={
            'choices': [{'finish_reason': finish, 'message': {'content': content, 'reasoning_content': 'Not for the editor'}}]})

    @patch('core.ai_provider.httpx.post')
    def test_correct_nvidia_endpoint_model_and_private_header(self, call):
        call.return_value = self.reply('{"title":"Planetas","questions":[]}')
        result = generate_draft(self.parameters)
        args, kwargs = call.call_args
        self.assertEqual(args[0], 'https://integrate.api.nvidia.com/v1/chat/completions')
        self.assertEqual(kwargs['json']['model'], 'deepseek-ai/deepseek-v4-flash-0731')
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer test-secret')
        self.assertFalse(kwargs['json']['stream'])
        self.assertNotIn('test-secret', json.dumps(result))
        self.assertNotIn('reasoning_content', result)

    @override_settings(NVIDIA_API_KEY='')
    @patch('core.ai_provider.httpx.post')
    def test_missing_key_makes_no_request(self, call):
        with self.assertRaises(GenerationError) as error:
            generate_draft(self.parameters)
        self.assertEqual(error.exception.status, 503)
        call.assert_not_called()

    @patch('core.ai_provider.httpx.post')
    def test_fenced_json_is_accepted(self, call):
        call.return_value = self.reply('```json\n{"title":"Planetas"}\n```')
        self.assertEqual(generate_draft(self.parameters)['title'], 'Planetas')

    @patch('core.ai_provider.httpx.post')
    def test_invalid_shapes_and_truncation_are_rejected(self, call):
        for content, finish in [('[]', 'stop'), ('null', 'stop'), ('Texto sem JSON', 'stop'), (None, 'stop'), ('{}', 'length')]:
            with self.subTest(content=content, finish=finish):
                call.return_value = self.reply(content, finish)
                with self.assertRaises(GenerationError):
                    generate_draft(self.parameters)

    @patch('core.ai_provider.httpx.post')
    def test_provider_errors_do_not_leak_body_or_key(self, call):
        for status in [400, 401, 403, 404, 429, 500]:
            call.return_value = httpx.Response(status, request=httpx.Request('POST', NVIDIA_ENDPOINT), text='test-secret internal-error')
            with self.assertRaises(GenerationError) as error:
                generate_draft(self.parameters)
            self.assertNotIn('test-secret', str(error.exception))
            self.assertNotIn('internal-error', str(error.exception))

    @patch('core.ai_provider.httpx.post', side_effect=httpx.ReadTimeout('private detail'))
    def test_timeout_is_actionable(self, call):
        with self.assertRaises(GenerationError) as error:
            generate_draft(self.parameters)
        self.assertEqual(error.exception.status, 504)

    @patch('core.ai_provider.httpx.post', side_effect=httpx.ConnectError('private detail'))
    def test_connection_failure_is_actionable(self, call):
        with self.assertRaises(GenerationError) as error:
            generate_draft(self.parameters)
        self.assertEqual(error.exception.status, 503)
