import random
import secrets
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .serializers import ActivitySerializer

def make_snapshot(activity, template):
    questions = ActivitySerializer(activity).data['questions']
    for number, question in enumerate(questions, 1):
        question['wheel_number'] = number
        random.SystemRandom().shuffle(question['answers'])
        candidate = secrets.choice(question['answers'])
        question['candidate'] = candidate['text']
        question['truth'] = candidate['correct']
    if template == 'roulette':
        random.SystemRandom().shuffle(questions)
    return list(questions)

def current_question(game):
    index = len(game.responses)
    if index >= len(game.snapshot):
        return None
    question = game.snapshot[index]
    data = {'id': question['id'], 'text': question['text'], 'index': index, 'total': len(game.snapshot)}
    if game.template == 'roulette':
        data['spun'] = bool(question.get('spun_at'))
        if not data['spun']:
            data['text'] = ''
            data['wheel_slots'] = sorted(q['wheel_number'] for q in game.snapshot[index:])
            return data
        data['wheel_number'] = question['wheel_number']
    if game.template == 'true-false':
        data['candidate'] = question['candidate']
    elif game.template == 'match':
        bank = [{'id': a['id'], 'text': a['text']} for q in game.snapshot for a in q['answers'] if a['correct']]
        random.SystemRandom().shuffle(bank)
        data['answers'] = bank
    elif game.template in ['quiz', 'roulette']:
        data['answers'] = [{'id': a['id'], 'text': a['text']} for a in question['answers']]
    return data

def spin_wheel(game):
    if game.template != 'roulette' or game.finished_at:
        raise ValidationError('A roleta não está disponível nesta partida.')
    question = game.snapshot[len(game.responses)]
    # Repetir a chamada mantém o sorteio e o relógio originais.
    if not question.get('spun_at'):
        question['spun_at'] = timezone.now().timestamp()
        game.save(update_fields=['snapshot'])
    return current_question(game)

def record_answer(game, payload):
    question = current_question(game)
    if game.finished_at or question is None:
        raise ValidationError('Esta partida já terminou.')
    if payload.get('question_id') != question['id']:
        raise ValidationError('Pergunta inválida ou resposta já registrada.')
    source = game.snapshot[len(game.responses)]
    if game.template == 'roulette' and not source.get('spun_at'):
        raise ValidationError('Gire a roleta antes de responder.')
    answer = next(a for a in source['answers'] if a['correct'])
    if game.template == 'true-false':
        if not isinstance(payload.get('value'), bool):
            raise ValidationError('Escolha verdadeiro ou falso.')
        correct = payload['value'] == source['truth']
    elif game.template == 'flashcards':
        if not isinstance(payload.get('learned'), bool):
            raise ValidationError('Informe se aprendeu o cartão.')
        correct = payload['learned']
    else:
        allowed = [a['id'] for a in question['answers']]
        if payload.get('answer_id') not in allowed:
            raise ValidationError('Alternativa inválida.')
        correct = payload['answer_id'] == answer['id']
    now = timezone.now()
    previous = game.responses[-1]['at'] if game.responses else game.started_at.timestamp()
    if game.template == 'roulette':
        previous = source['spun_at']
    elapsed = max(0, now.timestamp() - previous)
    points = (100 + max(0, 50 - int(elapsed * 2))) if correct and game.template != 'flashcards' else 0
    game.responses.append({'question_id': question['id'], 'correct': correct, 'seconds': round(elapsed, 2), 'points': points, 'at': now.timestamp()})
    game.score += points
    game.correct += int(correct)
    if len(game.responses) == len(game.snapshot):
        game.finished_at = now
    game.save()
    return {'correct': correct, 'answer': answer['text'], 'explanation': source.get('explanation', ''), 'points': points,
            'score': game.score, 'finished': bool(game.finished_at), 'next': current_question(game)}

def result_data(game):
    ranking = GameRanking(game)
    return {'id': str(game.id), 'name': game.guest_name, 'score': game.score, 'correct': game.correct,
            'total': len(game.snapshot), 'percentage': round(game.correct / len(game.snapshot) * 100),
            'seconds': round((game.finished_at - game.started_at).total_seconds()), 'ranking': ranking,
            'template': game.template, 'responses': game.responses}

def GameRanking(game):
    if game.template == 'flashcards':
        return []
    return list(game.activity.games.filter(finished_at__isnull=False, template=game.template)
                .order_by('-score', 'finished_at').values('guest_name', 'score')[:10])
