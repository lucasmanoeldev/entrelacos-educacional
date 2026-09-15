# Envio de e-mail pelo Gmail

A configuração do servidor está no `backend/.env` local e nas variáveis do serviço da API no Render.

```dotenv
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USE_SSL=false
EMAIL_HOST_USER=seuemail@gmail.com
EMAIL_HOST_PASSWORD=senha-de-aplicativo-do-google
DEFAULT_FROM_EMAIL=seuemail@gmail.com
```

Use uma [senha de aplicativo do Google](https://myaccount.google.com/apppasswords), com verificação em duas etapas ativada. Não use a senha normal da conta. Não publique `.env` no repositório.

Após preencher os dados e reiniciar o backend, execute na pasta `backend`:

```powershell
..\.venv\Scripts\python.exe manage.py check_smtp
```

O comando verifica conexão segura e autenticação, sem enviar mensagens e sem exibir credenciais. A entrega pode ser testada pela opção **Esqueci minha senha**, usando um e-mail já cadastrado no site.

No deploy, copie as variáveis para **Render → serviço da API → Environment**. O `.env` local não é enviado ao Render. Defina `FRONTEND_URL` com o endereço público do site, para os links de recuperação apontarem para o lugar correto.

O envio tem timeout de 20 segundos. TLS na porta 587 e SSL na porta 465 são opções diferentes; não ative as duas simultaneamente. Este projeto está configurado para TLS na porta 587.
