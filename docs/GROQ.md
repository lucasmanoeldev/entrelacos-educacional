# IA com Groq

O criador de atividades usa a API Groq exclusivamente no backend.

Configure em `backend/.env`:

```dotenv
GROQ_API_KEY=sua-chave
GROQ_MODEL=openai/gpt-oss-20b
```

Reinicie a API após modificar essas variáveis. Nunca coloque a chave nas variáveis públicas do frontend.

Para validar a conexão com uma pergunta real, execute `python manage.py check_groq` dentro de `backend`. O comando consome a cota do provedor, valida o rascunho e não salva nem publica conteúdo.

No Render, configure `GROQ_API_KEY` e `GROQ_MODEL` no serviço da API e faça um novo deploy. A chave fica somente no backend.

A integração usa Chat Completions com saída JSON. O backend valida perguntas e respostas antes de devolver o rascunho ao editor. Erros do provedor são traduzidos sem expor credenciais ou respostas internas.

Referências: [API Groq](https://console.groq.com/docs/api-reference) e [saída estruturada](https://console.groq.com/docs/structured-outputs).
