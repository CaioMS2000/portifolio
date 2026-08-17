# Como preencher os dados do CV

Este documento explica como editar `src/components/portfolio/cv-data.ts` — o único
lugar que você precisa tocar para atualizar o conteúdo do CV gerado (`public/cv.pdf`).

## O que vem de onde

O CV é montado por `scripts/generate-cv.tsx` a partir de duas fontes:

- **GitHub, ao vivo**: nome do projeto, descrição de uma linha, stack/tags e link do
  repositório. Isso já existe hoje pra qualquer repo com a topic `portifolio` — você
  **não edita isso aqui**, é automático.
- **`cv-data.ts`, manual**: tudo que não existe no GitHub — os bullets de decisão de
  engenharia por projeto, a experiência profissional e a formação. É só isso que este
  arquivo controla.

Depois de editar, rode `bun run generate-cv` pra regenerar `public/cv.pdf` e conferir o
resultado antes de commitar (o PDF em si não é versionado, é gerado a cada build).

## `cvProjects` — quais projetos entram no CV, e em que ordem

```ts
export const cvProjects: CvProjectEntry[] = [
	{
		repoSlug: 'nome-do-repo',
		highlights: [
			'processamento idempotente via outbox pattern',
			'documentado com ADRs e diagramas C4',
		],
	},
]
```

- **A ordem do array é a ordem de exibição no CV.** O primeiro item aparece primeiro.
- **`repoSlug`** precisa ser exatamente o nome do repositório no GitHub — o mesmo
  pedaço que aparece na URL `github.com/CaioMS2000/<repoSlug>`. Se não bater com
  nenhum repo que tenha a topic `portifolio`, o build falha com um erro claro (é
  proposital — melhor um erro visível do que um CV desatualizado silenciosamente).
- **`highlights`**: poucos bullets curtos por projeto(ter um equilibrio entre qualidade e não poluir o currículo). A régua aqui é *decisão de
  engenharia*, não descrição do projeto (a descrição de uma linha já vem do GitHub
  sozinha). Pense "o que eu decidi e por quê", não "o que o projeto faz":
  - Bom: `'consistência garantida com outbox pattern em vez de eventos direto na fila'`
  - Fraco: `'sistema de gerenciamento de pedidos'` (isso é descrição, não decisão —
    e já vem do GitHub)
  - Uma forma fácil de achar o highlight certo: olhe se o projeto tem um ADR em
    `docs/decisions/` ou um deep-dive em `docs/deep-dives/` — a frase de resumo
    desses documentos costuma virar o bullet quase pronto.

Só coloque aqui os projetos que você quer em destaque no CV — não precisa (nem deve)
listar todos os projetos que aparecem no portfólio.

## `cvExperience` — experiência profissional

```ts
export const cvExperience: CvExperience[] = [
	{
		company: 'Nome da empresa',
		role: 'Cargo',
		period: 'jan 2024 — atual', // texto livre, sem parsing de data
		bullets: [
			'bullet de impacto — o que você construiu e o efeito, não a descrição do cargo',
		],
	},
]
```

- Ordem do array = ordem de exibição (normalmente cronológica reversa: mais recente
  primeiro).
- `period` é texto livre de propósito — escreva do jeito que quiser mostrar
  (`'2022 — 2024'`, `'6 meses, 2023'`, etc.), não há formatação automática de datas.
- Bullets devem ser de impacto, não de responsabilidade. Evite frases genéricas tipo
  "responsável por manutenção do sistema" — prefira o que mudou por causa do seu
  trabalho.

## `cvEducation` — formação e certificados

```ts
export const cvEducation: CvEducationItem[] = [
	{ title: 'Ciência da Computação', institution: 'UFMG', period: '2019 — 2023' },
]
```

- `period` é opcional.
- Vale o mesmo corte de sempre pra certificados: só entra o que pesa de verdade (ex.
  uma cert de cloud reconhecida) — uma parede de certificados de curso online joga
  contra, não a favor.

## Outro campo relacionado, fora deste arquivo

`profile.siteUrl` em `src/components/portfolio/data.ts`. O cabeçalho do CV só mostra a linha da URL do portfólio, e essa URL é o motivo do CV existir (é o link que
leva de "vi o currículo" pra "vi o trabalho de verdade").
## Testando

```bash
bun run generate-cv   # gera public/cv.pdf a partir do estado atual de cv-data.ts
```

Abra o PDF gerado e confira: ordem das seções, acentuação, se o conteúdo ainda cabe
numa página só (não é uma garantia técnica — se passar do limite, o PDF pagina pra
página 2 automaticamente em vez de cortar conteúdo, mas o ideal pra um CV é continuar
enxuto o suficiente pra caber numa única página).
