# Mapeamento de campos: GitHub API → card de projeto

A API do GitHub expõe tudo que precisamos pro card de projeto, mas existem dois
mecanismos diferentes de "tag" que parecem iguais e não são.

## Campos diretos (`GET /repos/{owner}/{repo}`)

| Campo do card | Campo da API      | Observação                                                        |
| -------------- | ----------------- | ------------------------------------------------------------------ |
| Nome           | `name`             | slug do repo (path da URL) — precisa tratar (kebab-case → Título) |
| Descrição      | `description`      | texto que aparece embaixo do nome no GitHub                       |
| Link "Repo"    | `html_url`         | URL do repositório                                                 |
| Link "Demo"    | `homepage`         | campo preenchido em "About" no GitHub, se existir                 |

## Tags de stack — usar `topics`, não detecção automática

Existem dois jeitos de "tag" no GitHub:

- **`language` / `GET /repos/{owner}/{repo}/languages`** — detecção automática
  de linguagem de programação por bytes de código (via linguist). Pega "Go",
  "Dockerfile", etc., mas **não pega "PostgreSQL" ou "Kafka"** — não são
  linguagens de código, são infra/ferramentas, então o linguist não tem como
  detectar isso só olhando os arquivos.
- **`topics`** — tags manuais, adicionadas na engrenagem ao lado de "About" no
  repo (sem precisar de commit/código). Essas sim cobrem qualquer coisa:
  `go`, `postgresql`, `kafka`, `docker`, etc.

**Decisão**: usar `topics` para tudo — tanto para selecionar quais repos
aparecem no portfólio (ex: topic `portfolio`) quanto para listar a stack de
cada projeto. Mantém a mesma mecânica dos dois casos (só editar topics no
GitHub, sem tocar em código) e cobre ferramentas/infra que a detecção
automática de linguagem não cobre.

## Estratégia de fetch: SSG/ISR, não cache simples

- **Cache simples**: guarda o resultado de uma busca (ex: resposta da API),
  mas o servidor ainda executa a cada request — só pula a parte cara.
- **SSG**: pré-renderiza a página inteira (HTML + payload) como artefato de
  build. A requisição do visitante não executa lógica de servidor nenhuma —
  serve estático, potencialmente direto do CDN.
- **ISR**: SSG + revalidação automática (por tempo ou on-demand via
  `revalidatePath`/`revalidateTag` ou webhook do GitHub), sem precisar de
  redeploy completo.

Decisão: buscar os projetos via SSG/ISR filtrando repos pelo topic
`portfolio`, evitando lista hardcoded em código — adicionar um projeto novo
vira só "colocar o topic no repo", sem tocar em código e sem novo build.

## Acesso a arquivos (tree view / file view)

- **Tree view**: `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1` — um
  único request retorna toda a árvore de arquivos/pastas do repo (path + SHA
  de cada blob).
- **File view**: `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`
  para pegar os bytes crus do arquivo (ou a Contents API, que retorna em
  base64).
- Rate limit sem autenticação: 60 req/hora por IP — menos problema em build
  time (SSG/ISR) do que se fosse buscado por request no client.

## Conciliar geração estática (Server Component) com carregamento client-side seletivo (Mermaid)

O visualizador de arquivo é um Server Component `async` (busca no GitHub,
roda no servidor). Markdown (`react-markdown`) não tem dependência de DOM,
então renderiza tranquilo ali dentro. `mermaid`, porém, manipula
`document`/`window` pra desenhar o SVG — só pode rodar no browser.

**Primeira tentativa (errada)**: fazer `await import('mermaid')` dinâmico
dentro do `useEffect` de um Client Component (`MermaidDiagram`), mas
**importado estaticamente** por um Server Component. A suposição era que,
como o import dinâmico só executa dentro do `useEffect` (nunca durante SSR),
isso bastaria pra manter o bundle da lib fora do carregamento inicial.

**Por que não funcionou**: testando com `bun run build` + servidor de
produção de verdade (não só `bun dev`), o chunk inteiro do `mermaid`
(centenas de KB) aparecia sendo carregado em **toda** visita à página de
projeto — mesmo em repositórios sem nenhum bloco ` ```mermaid `. A causa,
confirmada na documentação do Next
(`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`):

> Quando um Server Component importa dinamicamente um Client Component, code
> splitting automático **não é suportado**.

Ou seja: um `import()` dinâmico dentro de um Client Component não isola nada
sozinho se esse Client Component, por sua vez, foi importado de forma
estática por um Server Component — o Next não consegue provar em build time
se aquele branch vai rodar ou não, então inclui tudo no grafo de bundle da
rota.

**Solução**: um Client Component intermediário e minúsculo
(`mermaid-diagram-lazy.tsx`) cujo único trabalho é chamar
`next/dynamic(() => import('./mermaid-diagram'), { ssr: false })` — isso só
funciona (e só é permitido) **dentro** de um Client Component; o próprio
Next lança erro se `ssr: false` for usado direto num Server Component. A
cadeia final: Server Component → import estático do wrapper (arquivo
pequeno, sem custo) → dentro do wrapper (contexto client), `next/dynamic`
isola de verdade o componente pesado num chunk separado, só buscado quando
`<MermaidDiagram>` realmente é renderizado.

**Como validar isso de verdade**: `curl` no HTML de produção e grep pelo
nome do chunk (`node_modules_mermaid_...`) — se aparecer num `<script>` da
página mesmo sem bloco mermaid no conteúdo, o code splitting não está
funcionando. `bun dev` sozinho não é confiável pra esse tipo de checagem
(Turbopack em modo dev não otimiza/separa do mesmo jeito que o build de
produção).
