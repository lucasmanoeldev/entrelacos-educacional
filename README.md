# Entrelaços · Plataforma educacional

MVP funcional implementado a partir de `PLANEJAMENTO_SITE_EDUCACIONAL.md`, com foco nas seções **80, 87 e 89**: professor cria uma atividade, publica, compartilha; aluno joga sem conta; professor consulta resultados.

## O que está implementado

- Página inicial responsiva, identidade própria e biblioteca pública com busca e filtros.
- Cadastro de professor, aluno ou escola; login; logout com revogação de sessão; rotação de token; recuperação de senha por e-mail.
- Dashboard, editor de perguntas, alternativas e explicações, edição, duplicação, publicação, retirada de publicação e exclusão com confirmação.
- Conteúdo independente do formato: **Quiz, Verdadeiro/Falso, Flashcards, Combine os pares e Roleta**.
- Compartilhamento por link, código de oito caracteres e QR Code.
- Partidas de convidados com apelido, correção e pontuação no servidor, ranking separado por formato.
- Relatórios por partida e pergunta; exportação CSV. Flashcards são autoavaliação, sem pontuação competitiva.
- Favoritos e geração de rascunhos com IA, validados no backend e revisáveis no editor.
- Django Admin para moderação, migração inicial, testes da API e configuração de CI.
- Frontend exportável em arquivos estáticos; API e banco persistentes separados.

## Arquitetura

```text
frontend/     Next.js 16 + React 19 + TypeScript → Vercel ou Render Static Site
backend/      Django 5.2 LTS + Django REST Framework → Render Web Service
PostgreSQL    Render Postgres (SQLite somente para desenvolvimento local)
```

Os jogos recebem perguntas sem gabarito. Cada partida guarda uma cópia do conteúdo, preservando os resultados quando a atividade é editada. Os tokens de acesso e de partida são armazenados apenas como hash na API. O token do professor dura 12 horas e fica no armazenamento da aba (`sessionStorage`); logout o revoga no servidor. O Django Admin usa sessão com CSRF.

## Rodar localmente

Requisitos: **Node.js 22+ e Python 3.12**. Execute os comandos na raiz deste projeto.

### 1. Instalar a API (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.lock
Copy-Item backend/.env.example backend/.env
cd backend
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py seed_demo
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

`seed_demo` é opcional e idempotente. Cria conteúdo de exemplo na biblioteca, com conta editorial inativa e sem senha utilizável. Cadastre sua própria conta pela interface.

### 2. Instalar o frontend (outro terminal)

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A API estará em [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/).

Após a instalação inicial, `powershell -ExecutionPolicy Bypass -File scripts/dev.ps1` inicia os dois serviços. No Linux/macOS, use `.venv/bin/python` em vez de `.venv\Scripts\python.exe`.

### Alternativa com Docker

`docker compose up --build` inicia PostgreSQL e API. Inicie o frontend com `npm run dev` em outro terminal. As migrations rodam na inicialização do serviço local. O volume `postgres_data` persiste os dados.

## Deploy

Veja **[docs/DEPLOY.md](docs/DEPLOY.md)** para os passos completos, variáveis e solução de erros.

| Opção | Frontend | API | Banco |
|---|---|---|---|
| Tudo no Render | Static Site | Web Service Python | PostgreSQL |
| Vercel + Render | Projeto Vercel, raiz `frontend` | Web Service Render, raiz `backend` | PostgreSQL |

Arquivos preparados: `render.yaml`, `frontend/vercel.json`, Dockerfile, lockfiles e exemplos de ambiente. Nenhum recurso de nuvem é criado automaticamente por instalar este projeto.

## IA e e-mail

Defina `NVIDIA_API_KEY` **somente na API**, nunca em variáveis `NEXT_PUBLIC_*`. `NVIDIA_MODEL` usa `deepseek-ai/deepseek-v4-flash-0731`. Veja [ativação NVIDIA](docs/NVIDIA.md). A chamada usa saída JSON e validação das perguntas; o professor revisa antes de publicar. Sem chave, a API responde com uma mensagem clara e a criação manual segue disponível.

Em desenvolvimento, os links de recuperação de senha aparecem no terminal do Django. Em produção configure SMTP conforme `backend/.env.example`; o console não entrega e-mails. A geração real com IA e a entrega real de e-mails dependem dessas credenciais.

## Testes

```powershell
cd backend
..\.venv\Scripts\python.exe manage.py test core -v 2
..\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
cd ../frontend
npm run build
```

O CI executa a API com PostgreSQL e compila o frontend. Os testes de navegador estão em `frontend/tests/`; consulte `docs/TESTES.md`.

## Administração

Execute `python manage.py createsuperuser` no ambiente da API e acesse `/admin/` no domínio da API. Nunca existe senha administrativa padrão. As contas de escola do MVP têm as funções de autoria; o painel de organização fica para a fase seguinte.

## Escopo e próximas fases

Este é o MVP recomendado pelo documento, **não a totalidade do roadmap de 90 seções**. Ainda não implementados: turmas/tarefas, gestão multiusuário de escolas, cobrança e assinaturas, uploads de imagens/PDF/DOCX, editor de ordenação e resposta curta, memória, gamificação avançada, verificação de e-mail, login social e sessões ao vivo. O Combine os pares usa seleção acessível de uma correspondência por vez; Flashcards usa progressão e autoavaliação, sem embaralhamento/voltar ainda.

Não há persistência de partida no navegador após recarregar a página; partidas concluídas ficam no banco. O relatório lista as últimas 500 partidas e a biblioteca as últimas 100 publicações. Edições geram novas perguntas; o histórico da versão anterior permanece nos resultados das partidas.

Antes de lançamento público institucional, finalize política de privacidade/termos, consentimento e gestão de dados adequados à escola, além de exportação/exclusão autônoma de conta. O MVP minimiza dados de convidados usando apelidos. O rate limiting do DRF é proteção básica por processo; para escala use cache compartilhado/controle de borda. Não há pagamentos ativos nem promessa de limite comercial de plano.

Detalhes da API: **[docs/API.md](docs/API.md)**.
