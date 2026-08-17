# ADR 001 — Fonte e estratégia de atualização dos dados dos projetos

## Status

Aceito

## Contexto

A seção "Projetos em destaque" da landing page, e a página de detalhe de cada projeto
(`/projetos/[repo]/...`), precisam de dados que já existem no GitHub: nome, descrição,
link do repositório, link de demo, stack usada, e o conteúdo dos arquivos do repositório.

Dois problemas a resolver:

1. **Quais repositórios aparecem no portfólio?** Nem todo repositório da conta do GitHub
   deve virar um card — tem projeto de estudo, fork, experimento.
2. **Como os dados chegam até o site, e com que atraso em relação ao GitHub?** A conta do
   GitHub muda (descrição, novo projeto, novo README) e o site precisa refletir isso sem
   exigir que cada mudança passe por um commit/deploy neste repositório.

Restrição relevante: a API do GitHub sem autenticação tem limite de 60 requisições/hora
por IP. Qualquer estratégia que faça o **navegador do visitante** chamar a API diretamente
compartilha esse limite entre todos os visitantes simultâneos.

## Opções consideradas

### A — Lista de projetos hardcoded no código (array em `data.ts`)

- Prós: nenhuma dependência externa, nenhum rate limit, previsível.
- Contras: cada projeto novo, ou cada atualização de descrição, exige editar código e
  fazer deploy deste repositório. O GitHub (fonte real dos projetos) e o site divergem
  com o tempo — é fácil esquecer de atualizar o card depois de mudar o repo.

### B — Fetch client-side direto à API do GitHub a cada visita

- Prós: sempre reflete o estado atual do GitHub, sem lógica de build.
- Contras: expõe o limite de 60 req/hora **por IP do visitante** — fácil de estourar
  com poucos cliques (um card já dispara N requisições, uma por repositório, mais as de
  árvore de arquivos na página de detalhe). Latência de rede visível para quem está
  navegando. Sem cache nenhum.

### C — SSG/ISR com revalidação por tempo (escolhida)

O fetch à API do GitHub acontece **no servidor**, em build ou em uma revalidação de ISR
(`next: { revalidate: 3600, tags: [...] }` no `fetch`), nunca a partir do navegador do
visitante.

- Prós: página serve conteúdo já resolvido — sem latência de API visível para quem
  navega. Poucas chamadas à API do GitHub mesmo com muitos visitantes simultâneos (o
  cache é compartilhado no servidor, não por IP). Continua sem lista hardcoded: adicionar
  projeto não toca em código.
- Contras: até 1h de defasagem entre uma mudança no GitHub e o reflexo no site (aceitável
  para um portfólio; não é um dado que precisa ser real-time).

## Decisão

- **Seleção de quais repositórios aparecem**: usar a topic manual `portifolio` no GitHub
  (`repo.topics.includes('portifolio')`), em vez de listar todos os repositórios públicos
  ou manter uma lista de nomes no código. Curadoria fica inteiramente do lado do GitHub —
  adicionar/remover um projeto do portfólio é editar as topics do repositório, sem PR
  neste repositório.
- **Busca e cache dos dados**: `getPortfolioProjects` chama
  `GET /users/{user}/repos` filtrando por topic, e cada rota de detalhe usa
  `GET /repos/{user}/{repo}` + Trees API + `raw.githubusercontent.com`, todos com
  `next: { revalidate: 3600, tags: ['github-repos', 'github-repo-{slug}'] }`
  ([src/lib/github.ts](../../src/lib/github.ts)). O uso de `tags` deixa o caminho aberto
  para revalidação sob demanda (`revalidateTag`) via webhook do GitHub no futuro, sem
  mudar a estratégia de fetch.

## Consequências

- Adicionar um projeto ao portfólio não exige tocar neste repositório — só marcar a
  topic `portifolio` no repo do projeto.
- O número de chamadas à API do GitHub fica baixo e previsível (uma leva por hora, não
  uma por visitante), o que mantém a aplicação dentro do limite de 60 req/h mesmo sem
  autenticação.
- Existe até 1h de defasagem entre uma atualização no GitHub (nova descrição, novo
  arquivo) e o site refletir isso por conta própria. Não implementamos revalidação por
  webhook — mas adicionamos um caminho manual pro mesmo problema: botões de "Atualizar"
  (Server Action + [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag),
  não `revalidateTag`, porque o objetivo é o dono do site ver o resultado na mesma
  resposta, não só marcar como stale para uma visita futura) tanto na listagem de
  projetos (`tag: 'github-repos'`) quanto na página de cada projeto
  (`tag: 'github-repo-{slug}'`). Continua sem ser automático — quem decide que vale a
  pena atualizar antes da 1h é o dono do site, clicando.
- **Dívida conhecida — resolvida em 2026-08-17**: as *tags de stack* exibidas em cada
  card (ex. "TypeScript", "Go") vinham só de `getRepoLanguages` (`/languages`, detecção
  automática por bytes de código via linguist), nunca de `topics`. Isso significava que
  infraestrutura/ferramentas que o linguist não reconhece como "linguagem" (PostgreSQL,
  Kafka, Docker etc.) não apareciam como tag mesmo quando marcadas como topic no
  repositório. Resolvido combinando as duas fontes: linguagens auto-detectadas continuam
  vindo do endpoint de sempre, e topics com prefixo `stack-` (ex. `stack-postgresql`)
  entram como tags adicionais, deduplicadas por nome — ver
  [src/lib/github.ts](../../src/lib/github.ts), `getPortfolioProjects`.
