# PLANEJAMENTO DO SITE — PLATAFORMA EDUCACIONAL INTERATIVA

## 1. Visão Geral

Desenvolver uma plataforma educacional interativa inspirada no conceito de ferramentas como Wordwall, porém com identidade visual, arquitetura, experiência e funcionalidades próprias.

O sistema permitirá que professores, escolas, criadores de conteúdo e alunos criem, compartilhem e utilizem atividades educacionais interativas.

A principal ideia da plataforma é:

**Criar o conteúdo uma vez e reutilizá-lo em diferentes formatos de atividades e jogos.**

Exemplo:

- Professor cria 10 perguntas sobre Sistema Solar.
- O mesmo conteúdo pode ser transformado em:
  - Quiz;
  - Verdadeiro ou falso;
  - Roleta;
  - Flashcards;
  - Combine os pares;
  - Jogo da memória;
  - Ordenação;
  - Complete a frase.

---

# 2. Objetivo do Produto

Criar uma plataforma SaaS educacional com foco em:

- Criação rápida de atividades;
- Gamificação;
- Inteligência artificial;
- Compartilhamento simples;
- Biblioteca pública;
- Relatórios de desempenho;
- Uso por professores, alunos e escolas;
- Possibilidade de monetização por assinatura.

---

# 3. Perfis de Usuário

## 3.1 Professor

Pode:

- Criar conta;
- Criar atividades;
- Criar atividades com IA;
- Editar atividades;
- Escolher template de jogo;
- Publicar atividade;
- Compartilhar atividade;
- Criar turmas;
- Convidar alunos;
- Acompanhar resultados;
- Visualizar rankings;
- Duplicar atividades públicas;
- Organizar atividades em pastas;
- Utilizar recursos premium.

---

## 3.2 Aluno

Pode:

- Entrar em atividade por link;
- Entrar por código;
- Entrar por QR Code;
- Jogar sem conta, quando permitido;
- Criar conta opcional;
- Visualizar pontuação;
- Visualizar ranking;
- Participar de turmas;
- Visualizar histórico, quando autenticado.

---

## 3.3 Escola / Organização

Pode:

- Criar organização;
- Adicionar professores;
- Gerenciar usuários;
- Criar turmas;
- Visualizar relatórios;
- Acompanhar desempenho;
- Gerenciar assinatura;
- Aplicar identidade visual da escola;
- Definir permissões.

---

## 3.4 Administrador da Plataforma

Pode:

- Gerenciar usuários;
- Gerenciar escolas;
- Gerenciar atividades;
- Moderar conteúdo;
- Gerenciar planos;
- Gerenciar pagamentos;
- Visualizar métricas;
- Gerenciar templates;
- Gerenciar categorias;
- Gerenciar prompts de IA;
- Suspender contas;
- Configurar limites do plano.

---

# 4. Estrutura Principal do Site

```text
/
├── Página Inicial
├── Explorar Atividades
├── Preços
├── Recursos
├── Para Professores
├── Para Escolas
├── Login
├── Cadastro
│
├── /dashboard
│   ├── Visão Geral
│   ├── Minhas Atividades
│   ├── Criar Atividade
│   ├── Biblioteca
│   ├── Favoritos
│   ├── Pastas
│   ├── Turmas
│   ├── Alunos
│   ├── Resultados
│   ├── IA
│   ├── Assinatura
│   └── Configurações
│
├── /atividade
│   ├── Criar
│   ├── Editar
│   ├── Visualizar
│   ├── Compartilhar
│   └── Resultados
│
├── /jogar
│   ├── Código
│   ├── Sessão
│   └── Resultado
│
├── /explorar
│   ├── Busca
│   ├── Categorias
│   ├── Matérias
│   ├── Ano Escolar
│   └── Templates
│
└── /admin
    ├── Dashboard
    ├── Usuários
    ├── Conteúdos
    ├── Templates
    ├── Escolas
    ├── Assinaturas
    ├── Pagamentos
    ├── IA
    └── Configurações
```

---

# 5. Página Inicial

## Objetivo

Explicar rapidamente o produto e converter visitantes em usuários.

## Estrutura

### Header

- Logo;
- Início;
- Explorar;
- Recursos;
- Para Escolas;
- Preços;
- Entrar;
- Criar conta.

### Hero

Título sugerido:

> Crie atividades educacionais interativas em poucos minutos.

Subtítulo:

> Transforme perguntas, conteúdos e aulas em jogos interativos para seus alunos.

Botões:

- Criar atividade grátis;
- Explorar atividades.

### Demonstração

Mostrar miniaturas dos jogos:

- Quiz;
- Flashcards;
- Memória;
- Roleta;
- Combine os pares.

### Seção IA

Título:

> Crie atividades usando Inteligência Artificial.

Exemplo:

```text
Tema: Sistema Solar
Ano: 6º ano
Quantidade: 10 perguntas
Dificuldade: Média

[ Gerar atividade ]
```

### Como Funciona

1. Digite ou gere o conteúdo;
2. Escolha um modelo;
3. Compartilhe com seus alunos;
4. Acompanhe os resultados.

### Templates

Grid com modelos disponíveis.

### Benefícios

- Rápido;
- Fácil;
- Gamificado;
- Compatível com celular;
- Resultados em tempo real;
- Compartilhamento por link.

### CTA

> Comece gratuitamente.

---

# 6. Autenticação

## Páginas

```text
/login
/cadastro
/esqueci-senha
/redefinir-senha
/verificar-email
```

## Cadastro

Campos:

- Nome;
- E-mail;
- Senha;
- Confirmar senha;
- Tipo de conta.

Tipos:

- Professor;
- Escola;
- Aluno.

## Login Social

Preparar suporte futuro para:

- Google;
- Microsoft.

---

# 7. Dashboard do Professor

## Sidebar

```text
Dashboard

Minhas atividades
Criar atividade
Biblioteca
Favoritos

Turmas
Alunos
Resultados

IA

Assinatura
Configurações
```

## Cards

- Total de atividades;
- Total de jogadas;
- Total de alunos;
- Média de acertos.

## Atividades Recentes

Mostrar:

- Imagem;
- Nome;
- Tipo;
- Quantidade de jogadas;
- Data;
- Status.

Ações:

- Jogar;
- Editar;
- Duplicar;
- Compartilhar;
- Resultados;
- Excluir.

---

# 8. Criador de Atividades

Rota:

```text
/dashboard/atividades/criar
```

## Etapa 1 — Escolher Forma de Criação

```text
Como deseja criar?

[ Criar manualmente ]

[ Criar com IA ]

[ Importar conteúdo ]
```

---

# 9. Criação Manual

## Dados Gerais

Campos:

- Título;
- Descrição;
- Matéria;
- Ano escolar;
- Idioma;
- Tags;
- Imagem de capa;
- Visibilidade.

Visibilidade:

- Pública;
- Privada;
- Somente com link.

---

# 10. Editor de Perguntas

Cada pergunta deve suportar:

- Texto;
- Imagem;
- Áudio futuramente;
- Vídeo futuramente.

## Tipos de Perguntas

### Múltipla escolha

```text
Pergunta

Resposta A
Resposta B
Resposta C
Resposta D

Resposta correta: B
```

### Verdadeiro ou Falso

```text
Afirmação

[ Verdadeiro ]
[ Falso ]
```

### Resposta curta

```text
Pergunta

Resposta aceita:
____________________
```

### Pares

```text
Brasil      Brasília
Argentina   Buenos Aires
Chile       Santiago
```

### Ordenação

```text
1. Mercúrio
2. Vênus
3. Terra
4. Marte
```

### Complete a frase

```text
A água ferve a ____ graus Celsius.

Resposta:
100
```

---

# 11. Templates de Atividades

## MVP

Desenvolver inicialmente:

1. Quiz;
2. Verdadeiro ou falso;
3. Flashcards;
4. Combine os pares;
5. Roleta;
6. Jogo da memória;
7. Complete a frase;
8. Ordenação.

---

# 12. Motor de Atividades

O conteúdo deve ser separado do jogo.

Exemplo:

```json
{
  "id": "activity_123",
  "title": "Sistema Solar",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Qual é o maior planeta?",
      "answers": [
        {
          "text": "Terra",
          "correct": false
        },
        {
          "text": "Júpiter",
          "correct": true
        },
        {
          "text": "Marte",
          "correct": false
        }
      ]
    }
  ]
}
```

Depois o mesmo conteúdo é renderizado por diferentes templates.

```text
Conteúdo
    ↓
Motor da atividade
    ↓
Templates
 ├── Quiz
 ├── Roleta
 ├── Flashcards
 ├── Memória
 └── Outros
```

---

# 13. Sistema de Templates

Cada template deve possuir:

```text
id
name
slug
description
thumbnail
category
minimum_questions
maximum_questions
settings_schema
status
premium
```

Exemplo:

```json
{
  "name": "Quiz",
  "slug": "quiz",
  "minimum_questions": 1,
  "maximum_questions": 100,
  "premium": false
}
```

---

# 14. Quiz

## Interface

Mostrar:

- Pergunta;
- Alternativas;
- Barra de progresso;
- Número da questão;
- Tempo;
- Pontuação.

## Pontuação

Exemplo:

```text
Resposta correta: +100 pontos
Bônus por velocidade: até +50
Sequência de acertos: bônus opcional
```

---

# 15. Verdadeiro ou Falso

Interface simples:

```text
A Terra é o maior planeta.

[ Verdadeiro ]

[ Falso ]
```

---

# 16. Flashcards

Estrutura:

```text
FRENTE

Qual é a capital do Brasil?

[ Virar cartão ]

VERSO

Brasília
```

Recursos:

- Próximo;
- Anterior;
- Embaralhar;
- Marcar como aprendido.

---

# 17. Combine os Pares

Exemplo:

```text
Brasil          Santiago
Argentina       Brasília
Chile           Buenos Aires
```

Usuário conecta corretamente.

Pontuação por:

- Acertos;
- Tentativas;
- Velocidade.

---

# 18. Roleta

Roleta pode selecionar:

- Perguntas;
- Nomes;
- Categorias;
- Palavras.

Fluxo:

```text
[ Girar ]

        ↓

Pergunta 4

        ↓

Responder
```

---

# 19. Jogo da Memória

Cards virados.

Exemplo:

```text
Brasil
Brasília

Argentina
Buenos Aires
```

O jogador encontra os pares.

---

# 20. Ordenação

Exemplo:

```text
Ordene os planetas.

Mercúrio
Vênus
Terra
Marte
```

Usar drag and drop.

---

# 21. Inteligência Artificial

Página:

```text
/dashboard/ia
```

## Criador com IA

Campos:

- Matéria;
- Tema;
- Ano;
- Quantidade de perguntas;
- Tipo;
- Dificuldade;
- Idioma.

Exemplo:

```text
Matéria:
História

Tema:
Revolução Industrial

Ano:
8º ano

Questões:
15

Dificuldade:
Média

[ Gerar ]
```

---

# 22. IA — Entrada por Texto

Professor pode digitar:

```text
Crie 10 perguntas sobre fotossíntese
para alunos do 7º ano.
```

IA gera:

- Título;
- Descrição;
- Perguntas;
- Respostas;
- Resposta correta;
- Explicações;
- Tags.

---

# 23. IA — Upload de Conteúdo

Preparar arquitetura para:

- PDF;
- DOCX;
- TXT;
- Imagens.

Fluxo:

```text
Upload
    ↓
Extração de texto
    ↓
IA
    ↓
Perguntas
    ↓
Professor revisa
    ↓
Atividade
```

---

# 24. Biblioteca de Atividades

Rota:

```text
/explorar
```

Filtros:

- Busca;
- Matéria;
- Série/Ano;
- Idioma;
- Tipo de atividade;
- Popularidade;
- Mais recentes.

---

# 25. Card da Atividade

Mostrar:

- Capa;
- Título;
- Criador;
- Tipo;
- Matéria;
- Jogadas;
- Avaliação.

Ações:

- Jogar;
- Ver;
- Duplicar;
- Favoritar.

---

# 26. Duplicar Atividade

Ao clicar:

```text
Duplicar
```

Criar uma cópia na conta do professor.

Depois permitir:

- Editar;
- Trocar perguntas;
- Trocar template;
- Publicar.

---

# 27. Sistema de Compartilhamento

Toda atividade possui:

```text
URL pública
Código curto
QR Code
iframe
```

Exemplo:

```text
https://seudominio.com/jogar/X8K4ZP
```

Código:

```text
X8K4ZP
```

---

# 28. Página /jogar

Campo central:

```text
Digite o código da atividade

[ ______ ]

[ Jogar ]
```

---

# 29. Sala de Jogo

Criador pode iniciar uma sessão.

Configurações:

- Nome da sessão;
- Permitir convidados;
- Exigir nome;
- Cronômetro;
- Mostrar ranking;
- Embaralhar perguntas;
- Embaralhar respostas.

---

# 30. Jogador Convidado

Fluxo:

```text
Link
 ↓
Digite seu nome
 ↓
Jogar
 ↓
Resultado
```

Não exigir cadastro.

---

# 31. Resultado Individual

Mostrar:

- Pontuação;
- Acertos;
- Erros;
- Tempo;
- Posição;
- Porcentagem.

Exemplo:

```text
Resultado

8 / 10

80%

Pontuação:
850

Posição:
3º
```

---

# 32. Ranking

Mostrar:

```text
1º Maria — 980
2º Lucas — 920
3º João — 850
```

Ranking pode utilizar:

- Pontuação;
- Acertos;
- Tempo.

---

# 33. Turmas

Professor cria:

```text
Nome:
7º Ano A

Matéria:
Ciências
```

Sistema gera:

```text
Código da turma

7AC8X
```

---

# 34. Alunos

Campos:

```text
id
name
email
class_id
status
created_at
```

Professor pode:

- Adicionar;
- Remover;
- Convidar;
- Visualizar resultados.

---

# 35. Tarefas para Turmas

Professor pode atribuir atividade.

Campos:

- Atividade;
- Turma;
- Data inicial;
- Data final;
- Tentativas;
- Mostrar respostas.

---

# 36. Relatórios

Dashboard:

```text
Jogadores
Tentativas
Média
Acertos
Tempo médio
```

---

# 37. Relatório por Pergunta

Exemplo:

```text
Pergunta 1

85% acertaram
15% erraram
```

---

# 38. Relatório por Aluno

Exemplo:

```text
Lucas

Atividades: 12
Média: 82%
Tempo médio: 5 min
```

---

# 39. Gamificação

Preparar arquitetura para:

- Pontos;
- Níveis;
- Medalhas;
- Sequências;
- Ranking;
- Conquistas.

Exemplo:

```text
🏆 Mestre do Quiz

Complete 20 quizzes.
```

---

# 40. Perfil

Página:

```text
/perfil/[username]
```

Mostrar:

- Nome;
- Foto;
- Bio;
- Atividades públicas;
- Seguidores futuramente.

---

# 41. Favoritos

Professor pode salvar atividades.

Tabela:

```text
favorites

id
user_id
activity_id
created_at
```

---

# 42. Pastas

Professor pode organizar:

```text
Matemática
Ciências
História
Inglês
```

---

# 43. Planos

## Gratuito

- Limite de atividades;
- Templates básicos;
- IA limitada;
- Biblioteca;
- Compartilhamento.

## Professor Pro

- Atividades ilimitadas;
- Mais templates;
- IA ampliada;
- Relatórios completos;
- Atividades privadas;
- Exportação;
- Sem publicidade.

## Escola

- Múltiplos professores;
- Painel da escola;
- Relatórios;
- Gestão de usuários;
- Branding.

---

# 44. Assinaturas

Preparar integração com gateway de pagamento.

Estrutura:

```text
subscriptions

id
user_id
plan_id
provider
provider_subscription_id
status
started_at
expires_at
```

---

# 45. Backend

Tecnologia sugerida:

```text
Python
Django
Django REST Framework
PostgreSQL
Redis
Celery
```

---

# 46. Frontend

Tecnologia sugerida:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Para animações:

```text
Framer Motion
```

Para drag and drop:

```text
dnd-kit
```

Para jogos mais avançados futuramente:

```text
Phaser.js
```

---

# 47. Infraestrutura

Arquitetura:

```text
Usuário
  ↓
Frontend
  ↓
API
  ↓
Backend
  ↓
PostgreSQL
```

Serviços auxiliares:

```text
Redis
Workers
Storage
IA
E-mail
Pagamentos
```

---

# 48. Banco de Dados

Principais tabelas:

```text
users
profiles

organizations
organization_users

classes
class_students

activities
activity_contents
activity_questions
activity_answers

templates
activity_template_settings

game_sessions
game_players
game_answers

results

favorites
folders
folder_activities

plans
subscriptions
payments

ai_generations

notifications

audit_logs
```

---

# 49. Tabela Users

```text
users

id
name
email
password_hash
role
avatar
email_verified_at
status
created_at
updated_at
```

---

# 50. Activities

```text
activities

id
creator_id
title
slug
description
subject
school_year
language
visibility
cover_image
status
created_at
updated_at
```

---

# 51. Questions

```text
questions

id
activity_id
type
title
description
image
position
points
time_limit
created_at
```

---

# 52. Answers

```text
answers

id
question_id
text
image
is_correct
position
```

---

# 53. Game Sessions

```text
game_sessions

id
activity_id
owner_id
code
status
started_at
ended_at
settings
```

---

# 54. Players

```text
game_players

id
session_id
user_id
guest_name
score
position
started_at
finished_at
```

---

# 55. Player Answers

```text
player_answers

id
player_id
question_id
answer_id
is_correct
response_time
points
```

---

# 56. API

Base:

```text
/api/v1/
```

---

# 57. Endpoints de Autenticação

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

---

# 58. Endpoints de Atividades

```text
GET    /activities
POST   /activities
GET    /activities/{id}
PUT    /activities/{id}
DELETE /activities/{id}

POST /activities/{id}/duplicate
POST /activities/{id}/publish
POST /activities/{id}/unpublish
```

---

# 59. Perguntas

```text
GET    /activities/{id}/questions
POST   /activities/{id}/questions

PUT    /questions/{id}
DELETE /questions/{id}
```

---

# 60. Templates

```text
GET /templates
GET /templates/{slug}
```

---

# 61. IA

```text
POST /ai/generate-activity
POST /ai/generate-questions
POST /ai/rewrite-question
POST /ai/generate-from-document
```

---

# 62. Jogos

```text
POST /game-sessions
GET  /game-sessions/{code}
POST /game-sessions/{code}/join
POST /game-sessions/{code}/answer
POST /game-sessions/{code}/finish
```

---

# 63. Resultados

```text
GET /activities/{id}/results
GET /game-sessions/{id}/results
GET /students/{id}/results
```

---

# 64. Turmas

```text
GET    /classes
POST   /classes
GET    /classes/{id}
PUT    /classes/{id}
DELETE /classes/{id}

POST /classes/{id}/students
```

---

# 65. Estrutura Frontend

```text
frontend/

src/
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── cadastro/
│   ├── explorar/
│   ├── jogar/
│   ├── atividade/
│   ├── dashboard/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── activities/
│   ├── games/
│   ├── editor/
│   ├── dashboard/
│   └── forms/
│
├── features/
│   ├── auth/
│   ├── activities/
│   ├── games/
│   ├── classes/
│   ├── reports/
│   └── ai/
│
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
└── utils/
```

---

# 66. Estrutura Backend

```text
backend/

config/
apps/
├── accounts/
├── organizations/
├── activities/
├── templates/
├── games/
├── classes/
├── reports/
├── ai/
├── subscriptions/
├── notifications/
└── core/
```

---

# 67. Design System

Criar design próprio.

## Características

- Educacional;
- Moderno;
- Divertido;
- Limpo;
- Fácil de usar;
- Responsivo.

## Componentes

```text
Button
Input
Textarea
Select
Card
Modal
Dropdown
Tabs
Tooltip
Badge
Avatar
Progress
Dialog
Toast
Table
Pagination
Sidebar
Navbar
```

---

# 68. Responsividade

Priorizar:

```text
Desktop
Tablet
Mobile
```

Jogos precisam funcionar perfeitamente em celular.

---

# 69. Segurança

Implementar:

- Hash seguro de senhas;
- JWT ou sessão segura;
- Refresh token;
- Rate limiting;
- Proteção CSRF;
- Validação de entrada;
- Sanitização;
- Controle de permissões;
- Logs;
- Limite de upload;
- Verificação de tipo de arquivo.

---

# 70. Permissões

Roles:

```text
ADMIN
TEACHER
STUDENT
SCHOOL_ADMIN
```

---

# 71. LGPD

Como o sistema pode envolver alunos, considerar:

- Consentimento;
- Política de privacidade;
- Termos de uso;
- Exclusão de conta;
- Exportação de dados;
- Minimização de dados;
- Controle de conteúdo.

---

# 72. SEO

Páginas públicas devem ser indexáveis.

Exemplo:

```text
/atividade/sistema-solar-123
```

Metadata:

- title;
- description;
- Open Graph;
- imagem;
- canonical.

---

# 73. Analytics

Monitorar:

```text
Cadastros
Atividades criadas
Atividades jogadas
Usuários ativos
Conversão
Retenção
Templates mais usados
IA utilizada
```

---

# 74. Painel Administrativo

## Dashboard

Mostrar:

```text
Usuários
Professores
Alunos
Escolas
Atividades
Jogadas
Receita
Assinaturas
Uso de IA
```

---

# 75. Moderação

Admin pode:

- Remover atividade;
- Bloquear usuário;
- Receber denúncia;
- Analisar conteúdo;
- Marcar conteúdo impróprio.

---

# 76. Sistema de Denúncia

Em atividades públicas:

```text
[ Denunciar ]
```

Motivos:

- Conteúdo impróprio;
- Spam;
- Violação de direitos;
- Informação incorreta;
- Outro.

---

# 77. Notificações

Preparar:

```text
notifications

id
user_id
type
title
message
read
created_at
```

Eventos:

- Atividade concluída;
- Nova tarefa;
- Assinatura;
- Convite de turma;
- Resultado disponível.

---

# 78. E-mails

Templates:

- Bem-vindo;
- Verificação;
- Recuperação de senha;
- Convite;
- Atividade atribuída;
- Assinatura;
- Pagamento.

---

# 79. Roadmap de Desenvolvimento

## Fase 1 — Fundação

- Projeto frontend;
- Projeto backend;
- Banco;
- Autenticação;
- Design system;
- Dashboard.

## Fase 2 — Criador

- Atividades;
- Perguntas;
- Respostas;
- Editor;
- Upload de imagem.

## Fase 3 — Jogos MVP

- Quiz;
- Verdadeiro/Falso;
- Flashcards;
- Combine os pares.

## Fase 4 — Compartilhamento

- URL;
- Código;
- QR Code;
- Jogadores convidados.

## Fase 5 — Resultados

- Sessões;
- Pontuação;
- Ranking;
- Relatórios.

## Fase 6 — IA

- Gerar atividade;
- Gerar perguntas;
- Editar com IA;
- Upload de conteúdo.

## Fase 7 — Mais Jogos

- Roleta;
- Memória;
- Ordenação;
- Complete a frase.

## Fase 8 — Turmas

- Turmas;
- Alunos;
- Tarefas;
- Histórico.

## Fase 9 — Biblioteca

- Busca;
- Filtros;
- Duplicar;
- Favoritos.

## Fase 10 — SaaS

- Planos;
- Pagamentos;
- Assinaturas;
- Limites;
- Escola.

---

# 80. MVP Recomendado

Não desenvolver tudo inicialmente.

O MVP deve possuir:

```text
Página Inicial

Login
Cadastro

Dashboard

Criar atividade

Quiz
Verdadeiro/Falso
Flashcards
Combine os pares

Compartilhar por link

Código da atividade

Jogador convidado

Pontuação

Ranking

Resultados

IA básica
```

---

# 81. Fluxo Principal

```text
Professor
    ↓
Cadastro
    ↓
Dashboard
    ↓
Criar atividade
    ↓
Adicionar conteúdo
    ↓
Escolher template
    ↓
Publicar
    ↓
Compartilhar link
    ↓
Aluno joga
    ↓
Sistema registra respostas
    ↓
Resultado
    ↓
Professor acompanha relatório
```

---

# 82. Fluxo com IA

```text
Professor
    ↓
Criar com IA
    ↓
Informar tema
    ↓
IA gera perguntas
    ↓
Professor revisa
    ↓
Escolhe template
    ↓
Publica
```

---

# 83. Regra Importante de Arquitetura

Não criar o conteúdo preso ao template.

ERRADO:

```text
Quiz possui perguntas próprias.
Roleta possui perguntas próprias.
Memória possui perguntas próprias.
```

CORRETO:

```text
Atividade
   ↓
Conteúdo
   ↓
Template
```

Assim é possível trocar:

```text
Quiz → Roleta
Quiz → Flashcards
Quiz → Memória
```

sem reconstruir o conteúdo.

---

# 84. Experiência do Usuário

A plataforma deve permitir criar uma atividade em poucos passos:

```text
1. Criar
2. Conteúdo
3. Template
4. Publicar
```

Evitar configurações excessivas.

---

# 85. Identidade Própria

Não copiar:

- Logo;
- Nome;
- Textos;
- Ilustrações;
- Código;
- Elementos visuais;
- Design exato;
- Assets;
- Conteúdos de terceiros.

Criar identidade e experiência próprias.

---

# 86. Prioridade de Desenvolvimento

Ordem recomendada:

```text
1. Autenticação
2. Atividades
3. Perguntas
4. Quiz
5. Sessões
6. Resultados
7. Compartilhamento
8. Outros templates
9. IA
10. Turmas
11. Biblioteca
12. Assinaturas
```

---

# 87. Resultado Esperado do Projeto

Ao finalizar o MVP, o sistema deverá permitir:

- Professor criar conta;
- Professor criar atividade;
- Adicionar perguntas;
- Selecionar um jogo;
- Publicar atividade;
- Gerar link;
- Aluno entrar sem cadastro;
- Jogar;
- Receber pontuação;
- Visualizar ranking;
- Professor visualizar resultados;
- Criar perguntas com IA.

---

# 88. Instrução para a IA Desenvolvedora

A IA responsável pelo desenvolvimento deve:

1. Desenvolver por módulos.
2. Não implementar tudo em um único arquivo.
3. Seguir arquitetura limpa.
4. Criar componentes reutilizáveis.
5. Criar API versionada.
6. Utilizar migrations.
7. Criar validações de backend.
8. Tratar erros adequadamente.
9. Criar loading states.
10. Criar empty states.
11. Criar estados de erro.
12. Criar layout responsivo.
13. Preparar internacionalização.
14. Separar conteúdo de jogos.
15. Criar testes para funcionalidades críticas.
16. Documentar endpoints.
17. Manter frontend e backend desacoplados.
18. Não colocar segredos no código.
19. Usar variáveis de ambiente.
20. Seguir boas práticas de segurança.

---

# 89. Critério de Conclusão do MVP

O MVP será considerado funcional quando:

```text
Usuário cria conta
      ↓
Cria atividade
      ↓
Adiciona perguntas
      ↓
Escolhe Quiz
      ↓
Publica
      ↓
Copia link
      ↓
Aluno acessa
      ↓
Responde
      ↓
Recebe resultado
      ↓
Professor visualiza relatório
```

Todo esse fluxo deve funcionar de ponta a ponta.

---

# 90. Próxima Evolução

Após validar o MVP:

- Adicionar novos templates;
- Melhorar IA;
- Criar marketplace de atividades;
- Criar planos pagos;
- Criar painel escolar;
- Aplicativo mobile;
- Gamificação avançada;
- Colaboração entre professores;
- Marketplace de conteúdo;
- Geração automática de atividades por material didático;
- Relatórios pedagógicos avançados.

---

# FIM DO DOCUMENTO
