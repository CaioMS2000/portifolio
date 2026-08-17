# Caio M. Silva — Portfólio

Site de portfólio pessoal. Além da landing page (hero, sobre, stack, contato), tem uma
página de detalhe por projeto com navegador de arquivos e visualizador de conteúdo
(syntax highlight + Markdown com GFM e diagramas Mermaid), tudo lido **direto do GitHub**
via API — sem duplicar conteúdo entre o repositório do projeto e este site.

## Como funciona

- A seção "Projetos em destaque" busca, em build/revalidação (SSG/ISR), todos os
  repositórios do GitHub com a topic `portifolio`. Adicionar ou remover um projeto da
  vitrine é só editar as topics do repo no GitHub — sem tocar em código nem fazer deploy
  aqui.
- Cada projeto tem uma rota própria (`/projetos/[repo]/[[...file]]` — catch-all opcional,
  então `/projetos/[repo]` sozinho já funciona e cai no README) que busca a árvore de
  arquivos do repositório (GitHub Trees API) e renderiza o conteúdo do arquivo
  selecionado — com highlight de sintaxe (Shiki) para código, e Markdown (GFM +
  diagramas Mermaid, carregados sob demanda) para `.md`.
- Por que essa decisão faz sentido e quais alternativas foram descartadas está em
  [docs/decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md](docs/decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md).

## Arquitetura

Visão geral (System Context) em [docs/architecture/context.md](docs/architecture/context.md):
o site é uma aplicação única (Next.js) que conversa com a API REST do GitHub — sem banco,
worker ou serviços adicionais.

## Decisões e aprendizados

- [ADR 001 — Fonte e estratégia de atualização dos dados dos projetos](docs/decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md)
- [Deep-dive — Por que o bundle do Mermaid vazava para toda página de projeto](docs/deep-dives/mermaid-lazy-loading.md)
- [Deep-dive — Por que um arquivo específico ficava desatualizado mesmo depois de revalidar](docs/deep-dives/raw-content-cdn-staleness.md)
- [Deep-dive — Por que um clique simples pra ver um projeto derrubava a página em produção](docs/deep-dives/server-action-closure-boundary.md)

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · Shiki (highlight) ·
react-markdown + remark-gfm · Mermaid · Biome

## Rodando localmente

```bash
bun install
bun dev
```

Abre em [http://localhost:3000](http://localhost:3000). O fetch de projetos usa a API
pública do GitHub sem autenticação (limite de 60 req/hora por IP) — suficiente para uso
local, já que as respostas ficam em cache (`revalidate: 3600`).

Outros scripts úteis: `bun run build` (build de produção — necessário para reproduzir o
comportamento de code-splitting descrito no deep-dive acima, que não aparece em `bun dev`),
`bun run lint`, `bun run check-types`.

## Limitações conhecidas / próximos passos

- Sem testes automatizados ainda.
- A revalidação automática dos dados do GitHub é só por tempo (`revalidate: 3600`); um
  webhook do GitHub disparando `updateTag` deixaria a atualização automática quase
  instantânea em vez de esperar até 1h. Hoje existe um caminho manual pro mesmo problema
  (botões de "Atualizar" na home e na página de cada projeto — contexto em
  [docs/decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md](docs/decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md)),
  mas nada automático ainda.
