from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Activity, Profile
from core.serializers import ActivitySerializer

class Command(BaseCommand):
    help = 'Cria três atividades públicas de exemplo, sem conta com senha conhecida.'
    def handle(self, *args, **options):
        user, created = get_user_model().objects.get_or_create(username='biblioteca@entrelacos.local', defaults={'email': 'biblioteca@entrelacos.local', 'first_name': 'Biblioteca Entrelaços', 'is_active': False})
        if created:
            user.set_unusable_password(); user.save()
        Profile.objects.get_or_create(user=user)
        content = [
            ('Uma viagem pelo Sistema Solar', 'Ciências', '6º ano', 'quiz', 'Explore os planetas e descubra nosso lugar no universo.', [
                ('Qual é o maior planeta do Sistema Solar?', ['Júpiter', 'Terra', 'Marte', 'Vênus'], 'Júpiter é o maior planeta do Sistema Solar.'),
                ('Qual planeta é conhecido como planeta vermelho?', ['Marte', 'Saturno', 'Urano', 'Mercúrio'], 'Os óxidos de ferro dão a Marte sua cor avermelhada.'),
                ('Qual astro está no centro do Sistema Solar?', ['Sol', 'Lua', 'Terra', 'Júpiter'], 'O Sol é a estrela em torno da qual os planetas orbitam.'),
                ('Qual é o terceiro planeta a partir do Sol?', ['Terra', 'Vênus', 'Marte', 'Netuno'], 'A Terra fica entre as órbitas de Vênus e Marte.'),
                ('Qual é o satélite natural da Terra?', ['Lua', 'Fobos', 'Europa', 'Titã'], 'A Lua é o único satélite natural da Terra.')]),
            ('Números que fazem sentido', 'Matemática', '4º ano', 'true-false', 'Um desafio de operações para pensar e aprender brincando.', [
                ('Quanto é 7 × 8?', ['56', '54', '64', '48'], 'Sete grupos de oito unidades somam 56.'),
                ('Quanto é 144 ÷ 12?', ['12', '14', '11', '16'], '12 × 12 = 144.'),
                ('Qual é a metade de 90?', ['45', '40', '35', '50'], 'Dividir 90 em duas partes iguais resulta em 45.')]),
            ('Palavras e seus encontros', 'Português', '5º ano', 'match', 'Conecte palavras aos seus sinônimos e amplie seu vocabulário.', [
                ('Qual é um sinônimo de alegre?', ['Feliz', 'Triste', 'Lento', 'Frio'], 'Alegre e feliz expressam contentamento.'),
                ('Qual é um sinônimo de veloz?', ['Rápido', 'Devagar', 'Alto', 'Pesado'], 'Veloz e rápido indicam grande velocidade.'),
                ('Qual é um sinônimo de bonito?', ['Belo', 'Feio', 'Antigo', 'Distante'], 'Belo e bonito expressam beleza.')])]
        for title, subject, year, template, description, rows in content:
            if Activity.objects.filter(creator=user, title=title).exists():
                continue
            questions = [{'text': text, 'explanation': explanation, 'answers': [{'text': a, 'correct': i == 0} for i, a in enumerate(answers)]} for text, answers, explanation in rows]
            serializer = ActivitySerializer(data={'title': title, 'description': description, 'subject': subject, 'school_year': year, 'template': template, 'visibility': 'public', 'questions': questions})
            serializer.is_valid(raise_exception=True)
            activity = serializer.save(creator=user, published=True)
            self.stdout.write(f'{activity.title}: {activity.code}')
