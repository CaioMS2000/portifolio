export type CvProjectEntry = {
	/** Slug cru do repo no GitHub — o mesmo usado em `exploreHref` (`/projetos/${slug}`). */
	repoSlug: string
	/** 1-2 bullets de decisão de engenharia, curados manualmente. */
	highlights: string[]
}

export type CvExperience = {
	company: string
	role: string
	/** Texto livre já formatado, ex: 'jan 2024 — atual'. */
	period: string
	bullets: string[]
}

export type CvEducationItem = {
	title: string
	institution: string
	period?: string
}

/** Ordem do array = ordem de exibição no CV. */
export const cvProjects: CvProjectEntry[] = [
	{
		repoSlug: 'portifolio',
		highlights: [
			'dados de projetos via SSG/ISR direto da API do GitHub, com curadoria só por topics do repositório — sem lista hardcoded nem CMS',
			'staleness de CDN em conteúdo de arquivo corrigida trocando a URL por SHA de commit imutável em vez de branch',
		],
	},
]

export const cvExperience: CvExperience[] = [
	{
		company: 'Evolight Energia Inovadora',
		role: 'Analista de Sistemas',
		period: 'Jan 2025 - Fev 2026',
		bullets: ['React JS', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
	},
	{
		company: 'CRMV GO',
		role: 'Estagiário de Desenvolvimento',
		period: 'Out 2021 - Dez 2023',
		bullets: [
			'React JS',
			'Python',
			'Django',
			'MySQL',
			'Docker',
			'Bootstrap',
			'TypeScript',
			'SASS',
		],
	},
]

export const cvEducation: CvEducationItem[] = [
	{
		title: 'Bacharelado em Engenharia da Computação',
		institution: 'PUC - GO',
		period: '2019 - 2024',
	},
]
