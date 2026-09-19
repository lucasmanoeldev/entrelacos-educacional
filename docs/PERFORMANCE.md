# Frontend Astro e desempenho da API

O frontend gera HTML estático em `frontend/out`, sem Next.js, React ou hidratação de componentes. O JavaScript de editor, jogos, relatórios e QR Code é importado apenas quando necessário.

As fontes variáveis DM Sans e Manrope são servidas pelo próprio site em WOFF2 com `font-display: swap`, sem a requisição CSS externa do Google Fonts.

## Navegação e dados antecipados

- `ClientRouter` troca as páginas no mesmo documento e preserva o menu e o cabeçalho do painel com `transition:persist`.
- Voltar/avançar e links diretos continuam funcionando. Abrir uma nova aba do navegador exige um carregamento inicial próprio.
- O Astro antecipa o HTML dos links. Ao passar o mouse ou focar links do painel, o cliente também antecipa as listas correspondentes.
- O cache de dados dura 30 segundos, tem no máximo 40 entradas e reúne requisições simultâneas. É separado por sessão e limpo nas alterações, no logout e em respostas 401.
- Relatórios, perguntas dos jogos e permissões no servidor não usam esse cache. O servidor valida a autorização em cada requisição.
- A navegação cancela tarefas da tela anterior, remove diálogos e encerra o temporizador do jogo. Prefetch de dados respeita o modo de economia de dados do navegador.

## Imagens

Use `src/components/OptimizedImage.astro` com uma imagem local importada. Ele gera WebP, tamanhos responsivos, dimensões explícitas e carregamento tardio. Para uma imagem principal acima da dobra, passe `eager`.

As ilustrações atuais são CSS e símbolos; não há fotos PNG/JPEG para converter. O favicon SVG continua vetorial e pequeno.

## Banco e API

- `activities/?summary=1` retorna cartões sem perguntas e gabaritos. O editor busca o conteúdo completo apenas quando aberto.
- Contagens de perguntas/partidas usam subconsultas na mesma consulta dos cartões; o autor vem por JOIN.
- Relatórios não recalculam o ranking a cada participante.
- Relações de perguntas e alternativas são carregadas em lote ao iniciar uma partida e ao abrir o editor.
- Índices cobrem professor/data, publicadas/visibilidade/data, partidas concluídas e ranking por formato.
- Conexões PostgreSQL são reutilizadas por até 60 segundos, com verificação de saúde.

Execute `python manage.py migrate --noinput` na API para aplicar os índices. O comando de inicialização do Render já inclui essa etapa. Faça o deploy da API antes do frontend.

## Limites

Estas mudanças reduzem transferências, JavaScript e viagens ao banco. Elas não eliminam a inicialização após suspensão de um serviço gratuito, nem a latência entre a API no Oregon e o banco em São Paulo. Não foi alterado nenhum plano ou região de hospedagem.

## Verificação

- `npm run build`: verificação TypeScript/Astro e geração estática.
- `python manage.py test core`: funcionalidades, isolamento entre usuários e orçamento de consultas.
- `npm run test:e2e`: cadastro → edição → publicação → partida → relatório/CSV, roleta móvel, navegação persistente e recuperação de erro.

Os testes de orçamento verificam 20 cartões com uma consulta de dados (a autenticação adiciona sua própria consulta em produção), sem gabaritos no resumo, e relatórios com número constante de consultas.

Validação local em 19/09/2026: build estático com 15 páginas, 36 testes da API aprovados e 9 testes de navegador aprovados contra o artefato gerado. O teste opcional do provedor real ficou desativado; o fluxo de rascunho foi testado com resposta simulada. Isso não representa uma medição de latência da hospedagem em produção.
