const GITHUB_USERNAME = 'CaioMS2000'
const PORTFOLIO_TOPIC = 'portifolio'
const REVALIDATE_SECONDS = 3600

type GithubRepoResponse = {
	name: string
	description: string | null
	homepage: string | null
	html_url: string
	topics?: string[]
	default_branch: string
}

type GithubTreeItem = {
	path: string
	type: 'blob' | 'tree' | 'commit'
	sha: string
	size?: number
}

type GithubTreeResponse = {
	sha: string
	tree: GithubTreeItem[]
	truncated: boolean
}

export type GithubProject = {
	name: string
	desc: string | null
	tags: string[]
	repoHref: string
	demoHref: string | null
	exploreHref: string
}

export type GithubProjectDetail = {
	name: string
	desc: string | null
	repoHref: string
	defaultBranch: string
}

export type TreeNode = {
	name: string
	path: string
	type: 'file' | 'folder'
	size?: number
	children?: TreeNode[]
}

function formatRepoName(slug: string): string {
	return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

async function getRepoLanguages(repoName: string): Promise<string[]> {
	const res = await fetch(
		`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
		{
			headers: { Accept: 'application/vnd.github+json' },
			next: { revalidate: REVALIDATE_SECONDS, tags: ['github-repos'] },
		}
	)

	if (!res.ok) return []

	const languages: Record<string, number> = await res.json()

	return Object.entries(languages)
		.sort((a, b) => b[1] - a[1])
		.map(([lang]) => lang)
}

async function fetchRepo(repoSlug: string): Promise<GithubRepoResponse | null> {
	const res = await fetch(
		`https://api.github.com/repos/${GITHUB_USERNAME}/${repoSlug}`,
		{
			headers: { Accept: 'application/vnd.github+json' },
			next: {
				revalidate: REVALIDATE_SECONDS,
				tags: ['github-repos', `github-repo-${repoSlug}`],
			},
		}
	)

	if (!res.ok) return null

	return res.json()
}

export async function getRepoDetail(
	repoSlug: string
): Promise<GithubProjectDetail | null> {
	const repo = await fetchRepo(repoSlug)

	if (!repo || !repo.topics?.includes(PORTFOLIO_TOPIC)) return null

	return {
		name: formatRepoName(repo.name),
		desc: repo.description || null,
		repoHref: repo.html_url,
		defaultBranch: repo.default_branch,
	}
}

function buildFileTree(items: GithubTreeItem[]): TreeNode[] {
	const root: TreeNode[] = []
	const folders = new Map<string, TreeNode>()

	const getFolder = (path: string): TreeNode[] => {
		if (!path) return root

		const existing = folders.get(path)
		if (existing) return existing.children as TreeNode[]

		const parentPath = path.split('/').slice(0, -1).join('/')
		const name = path.split('/').pop() as string
		const node: TreeNode = { name, path, type: 'folder', children: [] }

		getFolder(parentPath).push(node)
		folders.set(path, node)

		return node.children as TreeNode[]
	}

	for (const item of items) {
		if (item.type !== 'blob') continue

		const parentPath = item.path.split('/').slice(0, -1).join('/')
		const name = item.path.split('/').pop() as string

		getFolder(parentPath).push({
			name,
			path: item.path,
			type: 'file',
			size: item.size,
		})
	}

	const sortTree = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => {
			if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
			return a.name.localeCompare(b.name)
		})
		for (const node of nodes) {
			if (node.children) sortTree(node.children)
		}
	}
	sortTree(root)

	return root
}

export async function getRepoTree(
	repoSlug: string,
	branch: string
): Promise<{ tree: TreeNode[]; truncated: boolean; commitSha: string }> {
	const res = await fetch(
		`https://api.github.com/repos/${GITHUB_USERNAME}/${repoSlug}/git/trees/${branch}?recursive=1`,
		{
			headers: { Accept: 'application/vnd.github+json' },
			next: {
				revalidate: REVALIDATE_SECONDS,
				tags: ['github-repos', `github-repo-${repoSlug}`],
			},
		}
	)

	if (!res.ok) {
		console.error(
			`GitHub API respondeu ${res.status} ao buscar a árvore de ${repoSlug}`
		)
		return { tree: [], truncated: false, commitSha: branch }
	}

	const data: GithubTreeResponse = await res.json()

	if (data.truncated) {
		console.warn(`Árvore de ${repoSlug} truncada pela API do GitHub`)
	}

	return {
		tree: buildFileTree(data.tree),
		truncated: data.truncated,
		commitSha: data.sha,
	}
}

export function flattenFiles(tree: TreeNode[]): TreeNode[] {
	const files: TreeNode[] = []

	for (const node of tree) {
		if (node.type === 'file') {
			files.push(node)
		} else if (node.children) {
			files.push(...flattenFiles(node.children))
		}
	}

	return files
}

export async function getFileContent(
	repoSlug: string,
	ref: string,
	path: string
): Promise<{ content: string } | null> {
	const encodedPath = path.split('/').map(encodeURIComponent).join('/')
	const res = await fetch(
		`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoSlug}/${ref}/${encodedPath}`,
		{
			next: {
				revalidate: REVALIDATE_SECONDS,
				tags: ['github-repos', `github-repo-${repoSlug}`],
			},
		}
	)

	if (!res.ok) return null

	return { content: await res.text() }
}

export async function getPortfolioProjects(): Promise<GithubProject[]> {
	try {
		const res = await fetch(
			`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner`,
			{
				headers: { Accept: 'application/vnd.github+json' },
				next: { revalidate: REVALIDATE_SECONDS, tags: ['github-repos'] },
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
