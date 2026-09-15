from django.core.management.base import BaseCommand, CommandError
from core.ai_provider import generate_draft, GenerationError
from core.serializers import ActivitySerializer


class Command(BaseCommand):
    help = 'Valida a integração com uma chamada real de uma pergunta; não salva nem publica.'

    def handle(self, *args, **options):
        try:
            draft = generate_draft({'topic': 'Planetas do Sistema Solar', 'subject': 'Ciências',
                                    'school_year': '6º ano', 'count': 1, 'difficulty': 'Fácil'})
        except GenerationError as exc:
            raise CommandError(str(exc)) from None
        draft.update(subject='Ciências', school_year='6º ano', template='quiz', visibility='link')
        serializer = ActivitySerializer(data=draft)
        if not serializer.is_valid() or len(draft.get('questions', [])) != 1:
            raise CommandError('A NVIDIA respondeu, mas o conteúdo não passou pela validação do editor.')
        self.stdout.write(self.style.SUCCESS('NVIDIA: conexão e geração de uma pergunta validadas. Nenhum conteúdo foi salvo ou publicado.'))
