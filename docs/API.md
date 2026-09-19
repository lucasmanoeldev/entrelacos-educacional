# API v1

Base: `https://sua-api/api/v1/`. Todas as rotas terminam em `/`. Corpos JSON. Erros conhecidos usam `{"error": ...}`. O conteúdo do erro pode ser texto, lista ou campos de validação.

## Autenticação

Use `Authorization: Bearer <token>` nas rotas privadas. Sessões expiram em 12 horas. Refresh exige token ainda válido e o substitui; logout revoga. Senhas têm hash Django e validação mínima de 10 caracteres. Não existem credenciais fixas.

| Método | Rota | Corpo / resultado |
|---|---|---|
| POST | `auth/register/` | `{name, email, password, role?}` → `{user, token}` |
| POST | `auth/login/` | `{email, password}` → `{user, token}` |
| GET | `auth/me/` | Usuário atual |
| POST | `auth/logout/` | Revoga token |
| POST | `auth/refresh/` | Rotaciona token |
| POST | `auth/forgot-password/` | `{email}`; resposta genérica |
| POST | `auth/reset-password/` | `{uid, token, password}` |

Roles de cadastro: `TEACHER`, `STUDENT`, `SCHOOL_ADMIN`. Administradores são criados via Django, nunca por parâmetro de cadastro público.

## Atividades e biblioteca

| Método | Rota | Acesso |
|---|---|---|
| GET, POST | `activities/` | Atividades do professor atual / criar |
| GET | `activities/?summary=1` | Cartões do proprietário com contagens, sem perguntas nem gabaritos |
| GET, PUT, PATCH, DELETE | `activities/{uuid}/` | Somente proprietário |
| POST | `activities/{uuid}/publish/` | Proprietário |
| POST | `activities/{uuid}/unpublish/` | Proprietário |
| POST | `activities/{uuid}/duplicate/` | Atividade própria ou pública publicada |
| GET | `activities/{uuid}/results/` | Proprietário; últimas 500 partidas |
| GET | `explore/` | Pública; `q`, `subject`, `school_year`, `template`; até 100 |
| GET, POST, DELETE | `favorites/` | Conta atual; escrita recebe `{activity_id}` |

Exemplo de criação:

O painel usa o resumo para as listas. O detalhe continua retornando perguntas ao proprietário. Relatórios retornam `ranking: []`; o ranking é calculado apenas no resultado da partida do jogador.

```json
{
  "title": "Sistema Solar",
  "description": "Uma viagem pelos planetas",
  "subject": "Ciências",
  "school_year": "6º ano",
  "language": "pt-BR",
  "template": "quiz",
  "visibility": "link",
  "questions": [{
    "text": "Qual é o maior planeta?",
    "explanation": "Júpiter é o maior planeta do Sistema Solar.",
    "answers": [
      {"text": "Júpiter", "correct": true},
      {"text": "Terra", "correct": false}
    ]
  }]
}
```

Ao menos 1 pergunta, sem máximo fixo de quantidade; de 2 a 6 alternativas distintas, exatamente uma correta. Publicação é uma ação separada. Visibilidade: `public`, `link`, `private`. Formatos: `quiz`, `true-false`, `flashcards`, `match`, `roulette`. Perguntas são editadas junto da atividade, em transação; não há endpoint separado por pergunta neste MVP.

## Partidas

1. `GET games/{code}/`: metadados da atividade publicada, sem gabarito.
2. `POST games/{code}/`: `{name, template}` → `{id, token, question}`.
3. Use `X-Game-Token: <token da partida>` nas próximas operações.
4. `POST game-sessions/{id}/answer/`:
   - Quiz/pares: `{question_id, answer_id}`.
   - Verdadeiro/falso: `{question_id, value: true|false}`.
   - Flashcards: `{question_id, learned: true|false}`.
5. Resposta: `{correct, answer, explanation, points, score, finished, next}`.
6. Flashcards: `GET game-sessions/{id}/reveal/` revela apenas o cartão atual.
7. Após a última resposta: `GET game-sessions/{id}/result/` retorna métricas, respostas e ranking.

A API calcula 100 pontos por acerto + até 50 pontos por velocidade, com relógio do servidor. O tempo de leitura da explicação anterior entra no intervalo da próxima resposta. Respostas repetidas ou fora de ordem são recusadas. A partida e seu conteúdo ficam protegidos por token próprio, expiram para acesso após 12 horas e são bloqueados em transação durante a correção. Flashcards não pontuam; o resultado é autoavaliação. Ranking exibe as 10 melhores partidas por formato, não é um placar de identidades verificadas.

## IA

`POST ai/generate-activity/`: `{topic, subject, school_year, count, difficulty}`. `count` de 1 a 20, dificuldade `Fácil`, `Média`, `Difícil`. Retorna rascunho validado; **não publica nem salva automaticamente**. Chave ausente → 503; retorno inválido/provedor indisponível → 502.

## Health e operação

`GET health/` testa uma consulta ao banco. Rate limits padrão: anônimo 120/h, autenticado 1200/h, autenticação 15/h e IA 20/h. A entrada de convidados permite 1200/h por IP; respostas permitem 600/h por token de partida, para não bloquear uma turma inteira que compartilha o IP da escola. O cache local aplica limites por processo; configure cache compartilhado e limites de borda antes de escalar.

### Roleta

Antes de cada resposta em `roulette`, envie `POST game-sessions/{id}/spin/` com `X-Game-Token`. O servidor sorteia a ordem sem repetição, oculta a pergunta até o giro e mantém o mesmo sorteio em chamadas repetidas. A resposta do giro inclui `wheel_number`. A pontuação usa o tempo desde o sorteio; a animação faz parte desse intervalo. Resultado e ranking usam o mesmo fluxo dos outros jogos.
