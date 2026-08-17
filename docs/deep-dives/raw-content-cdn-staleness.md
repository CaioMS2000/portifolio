# Por que um arquivo específico ficava desatualizado mesmo depois de revalidar

O visualizador de arquivo (`/projetos/[repo]/...`) busca o conteúdo bruto de cada arquivo
em `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`, com cache do Next
(`revalidate: 3600`, mais os botões de "Atualizar" descritos no
[ADR 001](../decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md)). A expectativa
óbvia: revalidar (por tempo ou pelo botão) deveria sempre trazer o conteúdo atual.

Na prática, depois de um push real ao repositório do projeto, a árvore de arquivos
(pasta `docs/` nova) já aparecia atualizada — mas o conteúdo do `README.md`, um arquivo
que já existia antes do commit, continuou mostrando a versão antiga mesmo depois da janela
de revalidação passar.

## O contexto: duas fontes de dados diferentes atrás da mesma página

A página usa dois endpoints do GitHub que parecem equivalentes, mas não são:

- **Árvore de arquivos**: `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` —
  API REST (`api.github.com`), sem CDN de conteúdo na frente.
- **Conteúdo de cada arquivo**: `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`
  — servido por uma CDN (Fastly) do GitHub, com cache **próprio, por URL**, totalmente
  separado do cache do Next.

## Por que só o README ficava stale, e não os arquivos novos

A URL de conteúdo bruto usa o **nome da branch** (`.../main/README.md`) — a mesma URL
antes e depois de qualquer commit. Arquivos da pasta `docs/` eram novos: a URL deles nunca
tinha sido buscada antes, então a primeira busca já veio com o conteúdo atual (nada para
estar em cache). O `README.md` já existia antes do commit — a URL dele já estava em cache
na CDN de uma visita anterior, e essa CDN pode demorar pra invalidar depois de um push
(comportamento documentado do `raw.githubusercontent.com`, fora do nosso controle).

O detalhe que torna isso não-óbvio: mesmo forçando o Next a refazer a busca (janela de 1h
vencida, ou clicando em "Atualizar" — que usa `updateTag`, expira o cache do Next na
hora), a nova busca ainda podia receber os bytes antigos, porque quem responde não é o
nosso cache — é a CDN do GitHub, que tem sua própria decisão de quando aquela URL
específica fica stale.

## Como o diagnóstico foi confirmado

Testado ao vivo contra o repositório real (`CaioMS2000/portifolio`), sem alterar nada:

```bash
# SHA do blob, direto da árvore — não funciona como ref de conteúdo bruto
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://raw.githubusercontent.com/CaioMS2000/portifolio/<blob_sha>/README.md"
# → 404

# SHA do commit — funciona, mesmo conteúdo que buscar por branch
curl -s "https://raw.githubusercontent.com/CaioMS2000/portifolio/<commit_sha>/README.md"
# → 200, idêntico ao conteúdo buscado via .../main/README.md
```

O `404` do SHA de blob faz sentido em retrospecto: um blob é só o conteúdo endereçado por
hash, sem noção própria de "path" — a URL crua precisa de algo que resolva para um commit
(uma árvore inteira), não para um arquivo isolado.

## A solução

Buscar o conteúdo pelo **SHA do commit**, não pelo nome da branch — uma URL com SHA de
commit é imutável (aquele commit nunca muda), então nunca fica stale na CDN por
definição, não só "menos provável de ficar".

O achado que evitou uma chamada extra à API: o endpoint que a árvore de arquivos já usa,
`GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`, quando recebe um **nome de
branch** (não um SHA de árvore já resolvido), devolve no campo `sha` da própria resposta
o **SHA do commit** resolvido — não o SHA do objeto tree em si:

```bash
curl -s "https://api.github.com/repos/CaioMS2000/portifolio/git/trees/main?recursive=1" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['sha'])"
# → 635c67b9034f52c32b010aa6396936ed3227c503

curl -s "https://api.github.com/repos/CaioMS2000/portifolio/commits/main" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['sha'])"
# → 635c67b9034f52c32b010aa6396936ed3227c503  (idêntico)

curl -s "https://api.github.com/repos/CaioMS2000/portifolio/commits/main" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['commit']['tree']['sha'])"
# → 828776df8546ce48874dca70ee1dbfcf9237cc6b  (diferente — esse sim é o SHA da tree raiz)
```

Ou seja: o commit SHA já vinha de graça numa chamada que a página já fazia
(`getRepoTree`, em [src/lib/github.ts](../../src/lib/github.ts)) — só precisou ser
propagado até `getFileContent` no lugar do nome da branch.

## O que fica desse caso

Revalidar o **seu próprio** cache (por tempo, `revalidateTag` ou `updateTag`) só resolve
staleness que vive no seu próprio cache. Se a URL que você busca aponta pra um recurso
mutável (nome de branch, "latest", qualquer alias que muda de conteúdo ao longo do tempo)
servido por uma camada de cache que você não controla, revalidar o seu lado não garante
nada sobre o que essa URL de fato devolve no próximo fetch. A correção estrutural não é
"revalidar com mais força" — é trocar a URL por uma referência imutável (aqui, o SHA de
um commit específico) sempre que a fonte externa oferecer essa opção.
