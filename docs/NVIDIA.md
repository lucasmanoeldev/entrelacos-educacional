# IA com NVIDIA NIM

O criador em `/dashboard/ia/` usa **deepseek-ai/deepseek-v4-flash-0731** pela API NVIDIA:
`https://integrate.api.nvidia.com/v1/chat/completions`.

## Ativação local

1. Acesse a [página oficial do modelo](https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731), entre na sua conta e use **Generate API Key**.
2. No arquivo `backend/.env`, preencha:

```dotenv
NVIDIA_API_KEY=sua-chave-aqui
NVIDIA_MODEL=deepseek-ai/deepseek-v4-flash-0731
```

3. Reinicie a API. O `.env` está ignorado pelo Git. Não coloque a chave no frontend ou no chat.
4. Cadastre-se/entre como professor, acesse **Criar com IA**, informe tema, matéria, ano, quantidade e dificuldade.
5. Revise o rascunho no editor. Selecione o formato (incluindo Roleta), salve e publique.

Para verificar com uma chamada real pequena: `python manage.py check_nvidia`, dentro de `backend`. O comando gera uma pergunta e valida o formato; não publica nem salva. Essa chamada utiliza a cota de sua conta NVIDIA.

## Render / Vercel

Configure `NVIDIA_API_KEY` como segredo **no Web Service da API no Render**. O Blueprint solicita a chave e já define o modelo exato. Ao alterar a variável, reinicie/reimplante a API. A Vercel continua hospedando apenas o frontend e não recebe essa credencial.

O backend aguarda até 120 segundos de leitura da resposta; a interface permite 135 segundos e Gunicorn usa 150 segundos. O modo de raciocínio está desativado para priorizar a geração do rascunho. Não usamos streaming nem repetição automática de chamadas, para evitar gerações duplicadas em caso de erro.

## Validação e erros

- A resposta deve conter um objeto JSON; blocos Markdown JSON também são aceitos.
- Somente conteúdo final é usado, nunca campos de raciocínio do modelo.
- Perguntas, alternativas, resposta correta e quantidade passam pela validação do backend antes de abrir o editor.
- Chave ausente/inválida, acesso negado, modelo indisponível, limite de uso e timeout têm mensagens próprias.
- Erros não expõem a chave nem o corpo bruto retornado pelo provedor.
- A saída da IA continua exigindo revisão pedagógica antes da publicação.

Referências: [catálogo e exemplo de integração](https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731), [documentação do modelo](https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731).
