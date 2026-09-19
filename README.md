# 🎓 Entrelaços

**Plataforma educacional interativa para criação, compartilhamento e acompanhamento de atividades gamificadas.**

O **Entrelaços** é uma plataforma educacional que permite que professores criem atividades interativas, compartilhem com seus alunos e acompanhem os resultados em um único ambiente.

A plataforma foi desenvolvida para tornar a criação e aplicação de atividades mais simples, dinâmica e acessível.

### Como funciona

**Professor cria → publica → compartilha → aluno joga → professor acompanha os resultados.**

Os alunos podem participar das atividades sem necessidade de cadastro, utilizando apenas um apelido, link de compartilhamento, código da atividade ou QR Code.

## ✨ Principais recursos

* Criação e gerenciamento de atividades educacionais
* Quiz, Verdadeiro/Falso, Flashcards, Combine os Pares e Roleta
* Participação de alunos sem necessidade de conta
* Compartilhamento por link, código e QR Code
* Correção e pontuação processadas pelo servidor
* Ranking de participantes
* Relatórios por partida e pergunta
* Exportação de resultados em CSV
* Biblioteca pública de atividades
* Sistema de favoritos
* Geração de atividades com Inteligência Artificial
* Dashboard para professores
* Administração e moderação de conteúdo

## 🤖 Inteligência Artificial

O Entrelaços utiliza Inteligência Artificial para auxiliar professores na criação de atividades.

O professor informa um tema e a IA pode gerar um rascunho estruturado de perguntas e respostas.

**Tema → IA gera atividade → Backend valida → Professor revisa → Publicação**

O conteúdo gerado não é publicado automaticamente. O professor pode revisar, editar ou excluir as perguntas antes de disponibilizar a atividade aos alunos.

## Tecnologia e documentação

Frontend em **Astro**, API **Django** e banco **PostgreSQL/Supabase**. Geração de atividades com **Groq**.

- [Desenvolvimento local](docs/DESENVOLVIMENTO.md)
- [Publicação no Render/Vercel](docs/DEPLOY.md)
- [Configuração Groq](docs/GROQ.md)
- [Otimizações de desempenho](docs/PERFORMANCE.md)
- [Testes](docs/TESTES.md)
