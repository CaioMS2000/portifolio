# Por que um clique simples pra ver um projeto derrubava a página em produção

A página de detalhe de um projeto (`/projetos/[repo]/...`) começou a retornar 500 em
produção — só ao abrir a página, não em nenhuma ação específica do usuário. O board de
erros da Vercel mostrava um erro minificado do React (`#441`); os logs de runtime tinham a
mensagem completa por trás dele.

## O sintoma

A home funcionava normal, inclusive com seu próprio botão de "Atualizar". Só a página de
projeto (`/projetos/[repo]`) quebrava, e sempre — não era intermitente. Os logs da Vercel
traziam a causa direta:

```
Error: Functions cannot be passed directly to Client Components unless you explicitly
expose it by marking it with "use server". Or maybe you meant to call this function
rather than return it.
```

## A causa: uma closure não é uma "server reference"

Quando o botão de refresh foi generalizado (pra reaproveitar entre a home e a página de
projeto — [src/components/refresh-button.tsx](../../src/components/refresh-button.tsx)),
ele passou a receber a *action* como prop em vez de montar a chamada por dentro. A página
de projeto ficou assim:

```tsx
<RefreshButton action={() => revalidateProject(repo)} />
```

`RefreshButton` é um Client Component; `page.tsx` é um Server Component. `revalidateProject`
(em [actions.ts](../../src/app/projetos/%5Brepo%5D/actions.ts)) tem `'use server'` — mas o
que está de fato sendo passado como prop aqui não é `revalidateProject`, é uma **arrow
function nova**, criada em cada render, cujo corpo chama `revalidateProject`.

O `'use server'` marca `revalidateProject` para o compilador do Next substituir, no bundle
do cliente, o corpo real da função por um objeto serializável especial — uma "server
reference" (id do módulo + nome do export, o bastante pro servidor saber qual função rodar
quando o cliente invocar aquela referência). É só por causa dessa substituição que uma
função pode atravessar a fronteira Server → Client como prop: o que trafega não é código,
é uma referência que aponta de volta pro servidor.

Uma arrow function comum não passa por essa substituição — não tem o marcador. Do ponto de
vista do React, é só uma função de cliente qualquer sendo pedida para rodar no ambiente
errado, e ele recusa a serialização.

## Por que `.bind()` funciona e uma closure não

A correção:

```tsx
<RefreshButton action={revalidateProject.bind(null, repo)} />
```

`Function.prototype.bind()` chamado numa server reference é um caso especial que o React
reconhece: o resultado ainda é uma server reference válida (a mesma referência original,
com `repo` pré-aplicado como argumento), não uma função de cliente nova. `bind()` **não**
cria uma closure de cliente aqui — ele produz outra referência serializável para o mesmo
lado do servidor. Uma arrow function, mesmo que só chame a server action por dentro, é
sempre uma função de cliente nova; `bind()` numa server action nunca é.

## Diagnóstico

Os logs da Vercel no momento do incidente misturavam dois problemas sem relação: esse erro
de serialização, e uma leva de `504 Gateway Timeout` nas chamadas à API do GitHub — essa
segunda causa era uma instabilidade real e concorrente do lado do GitHub (confirmada via
githubstatus.com, não rate limit), e não teve nada a ver com o código. Separar as duas
coisas no mesmo log foi necessário antes de decidir onde olhar.

Uma dúvida que surgiu durante a correção: já que é um comportamento do Next/React, por que
não reproduziu localmente durante os testes da sessão? A resposta, confirmada revertendo a
correção e rodando `bun dev` de propósito: reproduz igual, com o mesmo erro. A serialização
do RSC que rejeita a closure acontece inteiramente no servidor, no mesmo ponto do render,
seja a navegação um `curl`/URL direta ou um clique em `<Link>`, seja em `bun dev` ou em
produção — não existe uma variante mais permissiva. O motivo de não ter aparecido antes
nos testes locais dessa sessão foi só não ter clicado na página de projeto durante a janela
específica (curta) em que a versão com a closure esteve de fato rodando — não um
comportamento do Next que difere entre ambientes.

## O que fica desse caso

Ao passar uma Server Action como prop para um Client Component, use a referência crua ou
`.bind()` nela — nunca envolva numa arrow function própria, mesmo que essa função só sirva
pra chamar a action. Isso importa especialmente ao generalizar um componente pra ser
reaproveitado em mais de um lugar: a versão original e não-generalizada deste botão nunca
teve esse bug, porque montava a chamada por dentro do próprio Client Component (só uma
`string` cruzava a fronteira); o bug nasceu exatamente no refactor que passou a aceitar a
action como prop.
