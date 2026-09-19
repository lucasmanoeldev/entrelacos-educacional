# Verificação

## API

`python manage.py test core -v 2`, na pasta backend. Os testes usam banco isolado e removem esse banco ao terminar. O CI usa PostgreSQL; localmente, SQLite é suficiente para o fluxo básico.

Cobertura: cadastro, senha fraca, papel administrativo bloqueado, permissões de aluno, isolamento entre professores, tokens revogados/rotacionados, atividade privada/rascunho, gabarito protegido, respostas repetidas, cinco formatos (incluindo sorteio de roleta sem repetição), relatório, duplicação, preservação da partida após edição e configuração ausente da IA.

## Frontend

`npm run build` compila TypeScript e exporta todas as páginas. O frontend pode ser validado com o próprio artefato de produção:

1. Inicie a API em `http://localhost:8000` com ambiente local e execute `python manage.py seed_demo`.
2. Na pasta frontend, execute `npm run build`.
3. Sirva `out`: `python -m http.server 3000 --directory out`.
4. Em outro terminal, na pasta frontend: `npm run test:e2e`.

O teste usa Chrome instalado. Para Chromium gerenciado pelo Playwright, instale `npx playwright install chromium` e ajuste o channel no arquivo de configuração, ou use `PLAYWRIGHT_CHANNEL=chromium`.

Os testes de navegador criam uma conta e atividade de teste **no banco apontado pela API**, portanto execute somente em desenvolvimento/staging. Eles verificam o cadastro pela interface, publicação, link, partida de convidado em tela de celular, resultado, relatório e download CSV, além de erros JavaScript e ausência de rolagem horizontal no celular. Não apontam para produção automaticamente.

Screenshots são geradas em `frontend/test-results`, que está ignorada pelo Git.

Os testes também verificam menu persistente, voltar/avançar, cache de listas, logout, recuperação após erro de rede, os cinco formatos e a passagem de um rascunho simulado da IA ao editor. Para usar portas isoladas, configure `PUBLIC_API_URL` antes do build, `E2E_API_URL` para a API dos testes e `E2E_BASE_URL` para o frontend; permita essa origem em `CORS_ALLOWED_ORIGINS` da API de teste.

## Integrações externas

### GROQ

Os testes automatizados do provedor usam respostas simuladas para verificar endpoint, modelo, JSON, timeout e erros, sem consumir cota. O teste real de navegador é opcional e fica desativado por padrão. Com a API local já usando uma chave GROQ válida, execute no PowerShell, dentro de `frontend`:

```powershell
$env:E2E_GROQ_LIVE='1'
npm run test:e2e -- --grep 'IA GROQ'
Remove-Item Env:E2E_GROQ_LIVE
```

Esse teste cria uma conta de desenvolvimento, gera uma pergunta real pelo formulário e confere o rascunho no editor. Não publica o conteúdo. Use somente em desenvolvimento/staging e considere a cota de sua conta.

O build local não comprova a publicação no provedor. Teste novamente os domínios, CORS, persistência PostgreSQL, entrega SMTP e geração real de IA após configurar o ambiente de nuvem. O repositório inclui os passos em `DEPLOY.md`.
