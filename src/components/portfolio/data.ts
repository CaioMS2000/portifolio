export const profile = {
	firstName: 'Lucas',
	lastName: 'Almeida',
	role: 'Software Engineer — backend & arquitetura',
	intro: 'Projeto sistemas backend e documento as decisões por trás deles.',
	bio: [
		'Sou engenheiro de software com foco em sistemas backend distribuídos. Gosto de problemas onde a arquitetura importa mais que o framework — consistência de dados, resiliência a falhas e observabilidade.',
		'Hoje trabalho principalmente com Go e TypeScript, projetando serviços que precisam se manter corretos sob concorrência e volume. Documento as decisões de arquitetura tanto quanto escrevo o código.',
	],
	formation:
		'Formação: Ciência da Computação, Universidade Federal de Minas Gerais',
	email: 'lucas.almeida@example.com',
	githubHref: 'https://github.com/lucasalmeida',
	linkedinHref: 'https://linkedin.com/in/lucasalmeida',
	cvHref: '#',
	copyrightYear: 2026,
}

export const projects = [
	{
		name: 'Outbox Ledger',
		desc: 'Gerenciador de pedidos com processamento idempotente e outbox.',
		tags: ['Go', 'PostgreSQL', 'Kafka', 'Docker'],
		exploreHref: '#',
		repoHref: '#',
		demoHref: '#',
	},
	{
		name: 'Fluxo',
		desc: 'Motor de orquestração de workflows com retries e observabilidade nativa.',
		tags: ['TypeScript', 'Node.js', 'Redis', 'gRPC'],
		exploreHref: '#',
		repoHref: '#',
		demoHref: '#',
	},
	{
		name: 'Sentinela',
		desc: 'Rate limiting distribuído com sliding window sobre Redis Cluster.',
		tags: ['Rust', 'Redis', 'gRPC'],
		exploreHref: '#',
		repoHref: '#',
		demoHref: '#',
	},
	{
		name: 'Arquivo',
		desc: 'Pipeline de ingestão de eventos com particionamento e replay determinístico.',
		tags: ['Kafka', 'ClickHouse', 'Go', 'Terraform'],
		exploreHref: '#',
		repoHref: '#',
		demoHref: '#',
	},
]

export const stackGroups = [
	{ label: 'Linguagens', items: ['Go', 'TypeScript', 'Rust', 'Python'] },
	{ label: 'Frameworks', items: ['Fiber', 'NestJS', 'Actix'] },
	{ label: 'Bancos', items: ['PostgreSQL', 'Redis', 'ClickHouse'] },
	{ label: 'Infra', items: ['Docker', 'Kubernetes', 'Terraform', 'AWS'] },
	{ label: 'Ferramentas', items: ['Grafana', 'GitHub Actions'] },
]
