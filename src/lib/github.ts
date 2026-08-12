const GITHUB_USERNAME = 'CaioMS2000'
const PORTFOLIO_TOPIC = 'portifolio'

type GithubRepoResponse = {
	name: string
	description: string | null
	homepage: string | null
	html_url: string
	topics?: string[]
}

export type GithubProject = {
	name: string
	desc: string | null
	tags: string[]
	repoHref: string
	demoHref: string | null
	exploreHref: string
}

function formatRepoName(slug: string): string {
	return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

async function getRepoLanguages(repoName: string): Promise<string[]> {
	const res = await fetch(
		`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
		{
			headers: { Accept: 'application/vnd.github+json' },
			next: { revalidate: 3600, tags: ['github-repos'] },
		}
	)

	if (!res.ok) return []

	const languages: Record<string, number> = await res.json()

	return Object.entries(languages)
		.sort((a, b) => b[1] - a[1])
		.map(([lang]) => lang)
}

export async function getPortfolioProjects(): Promise<GithubProject[]> {
	try {
		const res = await fetch(
			`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner`,
			{
				headers: { Accept: 'application/vnd.github+json' },
				next: { revalidate: 3600, tags: ['github-repos'] },
			}
		)

		if (!res.ok) {
			console.error(`GitHub API respondeu ${res.status} ao listar repositórios`)
			return []
		}

		const repos: GithubRepoResponse[] = await res.json()
		const featured = repos.filter(repo =>
			repo.topics?.includes(PORTFOLIO_TOPIC)
		)

		return await Promise.all(
			featured.map(async repo => ({
				name: formatRepoName(repo.name),
				desc: repo.description || null,
				tags: await getRepoLanguages(repo.name),
				repoHref: repo.html_url,
				demoHref: repo.homepage || null,
				exploreHref: `/projetos/${repo.name}`,
			}))
		)
	} catch (err) {
		console.error('Falha ao buscar projetos do GitHub', err)
		return []
	}
}
