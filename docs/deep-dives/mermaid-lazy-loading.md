# Por que o bundle do Mermaid vazava para toda página de projeto

A página de detalhe de um projeto (`/projetos/[repo]/...`) renderiza `.md` com
`react-markdown`, e blocos ` ```mermaid ` viram diagramas SVG desenhados no navegador pela
biblioteca `mermaid`. O objetivo era óbvio: **só quem visita um arquivo com diagrama
Mermaid deveria pagar o custo de carregar essa biblioteca** (algumas centenas de KB). Visitar
o `README.md` de um repositório sem nenhum diagrama não devia baixar `mermaid` nenhuma.
Na prática, isso não aconteceu de primeira — e o motivo revela uma regra pouco intuitiva
do App Router do Next.js sobre onde o code-splitting automático funciona e onde não
funciona.

## O contexto: Server Component com um pedaço client-only dentro

O visualizador de arquivo (`FileContent`) é um Server Component `async` — ele busca o
conteúdo bruto do arquivo direto da API do GitHub e roda inteiramente no servidor.
Markdown puro (via `react-markdown` + `remark-gfm`) não precisa de DOM, então renderiza
sem problema dentro de um Server Component.

`mermaid`, por outro lado, manipula `document`/`window` para desenhar o SVG — só pode
rodar no navegador. Isso força um Client Component (`'use client'`) em algum ponto da
árvore só para os diagramas.

## Primeira tentativa (e por que parecia certa)

A primeira versão de `MermaidDiagram` era um único Client Component que fazia o import da
biblioteca dinamicamente, mas só dentro do `useEffect`:

```tsx
'use client'
export function MermaidDiagram({ code }: { code: string }) {
  useEffect(() => {
    async function render() {
      const mermaid = (await import('mermaid')).default
      // ...
    }
    render()
  }, [code])
  // ...
}
```

O raciocínio: `useEffect` só roda no navegador, depois da hidratação — nunca durante SSR.
Então um `import()` dinâmico ali dentro pareceria uma forma natural de manter o bundle da
lib fora do carregamento inicial da página, sem precisar de nenhuma ferramenta especial do
Next.js.

## Por que não funcionou

Testando com `bun dev`, tudo parecia certo. O problema só apareceu testando um
**build de produção de verdade** (`bun run build` + `bun start`): o chunk inteiro do
`mermaid` — centenas de KB — era carregado em **toda** visita a uma página de projeto,
mesmo em repositórios sem um único bloco ` ```mermaid ` no conteúdo.

A causa está documentada na própria documentação do Next
(`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`):

> Quando um Server Component importa dinamicamente um Client Component, code splitting
> automático não é suportado.

Ou seja: o `import()` dinâmico *dentro* do `useEffect` de `MermaidDiagram` não é o que
importa para o bundler. O que importa é *como* `MermaidDiagram` — o Client Component
inteiro — chega até a árvore que é renderizada no servidor. Como `FileContent` (Server
Component) importava `MermaidDiagram` **estaticamente** (`import { MermaidDiagram } from
'./mermaid-diagram'`), o Next não consegue provar em tempo de build se aquele branch do
componente vai ser exercitado ou não — então ele inclui o componente, e tudo que ele
importa (inclusive o `import()` "dinâmico" de dentro do `useEffect`), no grafo de bundle
da rota inteira. O `useEffect` protege *quando* o código roda; não protege *o que entra no
bundle enviado ao navegador* — essas são duas perguntas diferentes, e só a segunda decide
o tamanho do JavaScript baixado.

## Como o diagnóstico foi confirmado

`bun dev` sozinho não é confiável para esse tipo de checagem — o Turbopack em modo dev não
otimiza/faz code-splitting da mesma forma que o build de produção. A validação real foi:

```bash
bun run build && bun start
curl -s http://localhost:3000/projetos/algum-repo-sem-mermaid | grep 'node_modules_mermaid'
```

Se o nome do chunk do `mermaid` aparece num `<script>` da página mesmo sem bloco Mermaid
no conteúdo, o code splitting não está funcionando — foi exatamente o que apareceu antes
da correção, e o que confirma a correção depois.

## A solução

Um Client Component intermediário, mínimo, cujo único trabalho é isolar o
`next/dynamic` com `ssr: false`:

```tsx
// mermaid-diagram-lazy.tsx
'use client'
import dynamic from 'next/dynamic'

export const MermaidDiagram = dynamic(
  () => import('./mermaid-diagram').then(m => m.MermaidDiagram),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-[6px] bg-muted" /> }
)
```

`next/dynamic` com `ssr: false` só é permitido dentro de um Client Component — o próprio
Next lança erro em build se for usado direto num Server Component. A cadeia final:

```
Server Component (FileContent/MarkdownContent)
  → import estático de mermaid-diagram-lazy.tsx  (arquivo pequeno, sem custo real)
    → dentro dele, contexto client: next/dynamic isola de verdade
      o componente pesado (mermaid-diagram.tsx) num chunk separado,
      só buscado quando <MermaidDiagram> é efetivamente renderizado
```

A diferença para a primeira tentativa não é "ter um `import()` dinâmico" — é *onde* esse
`import()` fica registrado. `next/dynamic` marca o ponto de split de um jeito que o
bundler consegue rastrear estaticamente, mesmo quando o componente que o usa foi puxado
por um Server Component; um `import()` solto dentro de um `useEffect` não deixa esse
rastro para o bundler, só para o runtime.

## O que fica desse caso

A regra geral: **o limite Server → Client é o que decide o que entra no bundle da rota,
não o timing de execução dentro do Client Component.** Um `useEffect` decide *quando* algo
roda no navegador; não decide *se* o navegador precisa baixar aquele código para chegar
até ali. Para isolar de verdade um pedaço pesado e opcional de uma árvore que nasce num
Server Component, o ponto de lazy-loading precisa estar explícito para o bundler
(`next/dynamic`) — e esse ponto só pode existir dentro de um Client Component.
