# Publicação na Vercel ou no Render

## Antes de começar

1. Envie esta pasta para um repositório Git seu, incluindo `frontend/package-lock.json`, `backend/requirements.lock` e migrations.
2. Não envie `.env`, `.env.local`, `.venv`, `node_modules` ou `db.sqlite3`.
3. Decida o domínio final do frontend. Use a URL exata na configuração de CORS, sem barra final.

## Teste gratuito no Render com SQLite

O `render.yaml` cria somente uma API no plano **free**, sem PostgreSQL e sem disco pago.

1. Conecte o repositório em **New → Blueprint**.
2. Informe `NVIDIA_API_KEY` no painel para ativar a IA.
3. A API usa `DEBUG=false`, `ALLOW_SQLITE=true` e `DATABASE_URL=sqlite:////tmp/entrelacos.sqlite3`.
4. As migrations executam na inicialização, antes do Gunicorn, criando as tabelas quando o arquivo não existir.
5. `SECRET_KEY` é gerada pelo Render e permanece nas variáveis do serviço.
6. Verifique `/api/v1/health/`. Cadastre uma nova conta; o banco local não é enviado.

**Os dados são temporários e podem desaparecer em reinícios ou deploys.** O plano gratuito também pode suspender a API por inatividade. Use apenas para testes.

SMTP fica desativado (`django.core.mail.backends.dummy.EmailBackend`), porque o Render gratuito bloqueia as portas do Gmail. Recuperação de senha não envia mensagens nesse ambiente. A configuração local do Gmail permanece no `.env` local.

O frontend continua local por padrão (`http://localhost:3000`). Ao hospedá-lo, atualize `FRONTEND_URL` e `CORS_ALLOWED_ORIGINS` na API; no frontend, configure `NEXT_PUBLIC_API_URL=https://sua-api.onrender.com/api/v1` e refaça o build.

## Opção B — Frontend na Vercel e API no Render

### API e banco no Render

Crie um PostgreSQL e um Web Service Python conectados ao repositório:

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.lock && python manage.py collectstatic --noinput` |
| Pre-Deploy Command | `python manage.py migrate --noinput` |
| Start Command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 150` |
| Health Check Path | `/api/v1/health/` |
| Python | `PYTHON_VERSION=3.12.14` |

Para migrar para produção persistente, use um plano pago que suporte pre-deploy e configure:

```text
DEBUG=false
ALLOW_SQLITE=false
SECRET_KEY=<gere um segredo aleatório longo>
DATABASE_URL=<Internal Database URL do PostgreSQL Render>
FRONTEND_URL=https://seu-projeto.vercel.app
CORS_ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

Para gerar uma chave localmente: `python -c "import secrets; print(secrets.token_urlsafe(64))"`. Insira o resultado como segredo no painel. A API aceita automaticamente seu `RENDER_EXTERNAL_HOSTNAME`. Para domínio próprio, adicione `ALLOWED_HOSTS=api.seudominio.com` (sem protocolo).

### Frontend na Vercel

1. **Add New → Project**, importe o mesmo repositório.
2. **Root Directory: `frontend`**. Framework: **Next.js**.
3. Use Node.js **22.x**. Build: `npm run build`. O `vercel.json` configura a saída `out`.
4. Cadastre `NEXT_PUBLIC_API_URL=https://sua-api.onrender.com/api/v1` no ambiente Production e, se necessário, Preview.
5. Faça deploy. Atualize `FRONTEND_URL` e `CORS_ALLOWED_ORIGINS` da API com o domínio definitivo.

`NEXT_PUBLIC_API_URL` é inserida no JavaScript durante o build. **Alterou a URL da API? Faça um novo build/deploy do frontend.** Não coloque chaves de IA, banco ou Django na Vercel: ela hospeda apenas o frontend neste projeto.

Para previews, adicione somente as origens necessárias ao CORS, separadas por vírgula. Não use curingas para todos os subdomínios `vercel.app`.

## Complementos opcionais

- **IA NVIDIA:** `NVIDIA_API_KEY` na API. Modelo: `NVIDIA_MODEL=deepseek-ai/deepseek-v4-flash-0731`. Veja [NVIDIA.md](NVIDIA.md).
- **E-mail:** configure SMTP (`EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`).
- **Biblioteca de exemplo:** no shell da API, `python manage.py seed_demo`.
- **Admin:** no shell da API, `python manage.py createsuperuser`.

## Conferência após publicar

1. Health check retorna `{"status":"ok"}`.
2. Cadastre um professor e entre no dashboard.
3. Crie uma pergunta com alternativas e publique como “Quem tiver o link”.
4. Copie o link e abra em janela anônima ou outro dispositivo.
5. Entre com um apelido, responda e confira resultado/ranking.
6. No professor, abra **Resultados** e confira a partida.
7. Reinicie a API e confirme que a atividade e o resultado continuam disponíveis.
8. Teste envio de recuperação de senha e IA após configurar seus provedores.

## Problemas comuns

| Sintoma | Verificação |
|---|---|
| Falha de conexão | URL da API, serviço ativo e CORS com a origem exata |
| Funciona local, falha no jogo publicado | Header `X-Game-Token` permitido em CORS; configuração já incluída |
| API não inicia | `SECRET_KEY` e `DATABASE_URL` obrigatórias com `DEBUG=false` |
| 400 DisallowedHost | `RENDER_EXTERNAL_HOSTNAME` ou `ALLOWED_HOSTS` do domínio próprio |
| Banco sem tabelas | Logs da etapa `python manage.py migrate --noinput` |
| Frontend usa API antiga | Novo deploy após mudar `NEXT_PUBLIC_API_URL` |
| Recuperação não chega | SMTP ainda não configurado; console não envia mensagens |
| IA retorna indisponível | Configure a chave somente na API e verifique o modelo disponível |

## Referências oficiais

- [Deploy de Django no Render](https://render.com/docs/deploy-django)
- [Blueprints do Render](https://render.com/docs/blueprint-spec)
- [Monorepos no Render](https://render.com/docs/monorepo-support)
- [Export estático do Next.js](https://nextjs.org/docs/app/guides/static-exports)
