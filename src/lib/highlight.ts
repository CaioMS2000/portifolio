import { codeToHtml } from 'shiki'

const MAX_HIGHLIGHT_BYTES = 300_000

const EXTENSION_TO_LANG: Record<string, string> = {
	ts: 'typescript',
	tsx: 'tsx',
	js: 'javascript',
	jsx: 'jsx',
	mjs: 'javascript',
	cjs: 'javascript',
	json: 'json',
	jsonc: 'jsonc',
	md: 'markdown',
	mdx: 'mdx',
	css: 'css',
	html: 'html',
	py: 'python',
	go: 'go',
	rs: 'rust',
	java: 'java',
	rb: 'ruby',
	php: 'php',
	sh: 'bash',
	bash: 'bash',
	yml: 'yaml',
	yaml: 'yaml',
	toml: 'toml',
	sql: 'sql',
	graphql: 'graphql',
	prisma: 'prisma',
	dockerfile: 'docker',
	txt: 'text',
	env: 'bash',
}

const BINARY_EXTENSIONS = new Set([
	'png',
	'jpg',
	'jpeg',
	'gif',
	'webp',
	'ico',
	'svg',
	'pdf',
	'zip',
	'gz',
	'woff',
	'woff2',
	'ttf',
	'eot',
	'otf',
	'mp4',
	'mov',
	'wasm',
	'bin',
	'lock',
])

function getExtension(path: string): string {
	return path.split('.').pop()?.toLowerCase() ?? ''
}

export function isBinaryPath(path: string): boolean {
	return BINARY_EXTENSIONS.has(getExtension(path))
}

export function getLanguageFromPath(path: string): string {
	return EXTENSION_TO_LANG[getExtension(path)] ?? 'text'
}

export async function highlightCode(
	code: string,
	path: string
): Promise<{ html: string; skipped: boolean }> {
	if (Buffer.byteLength(code, 'utf8') > MAX_HIGHLIGHT_BYTES) {
		return { html: '', skipped: true }
	}

	const html = await codeToHtml(code, {
		lang: getLanguageFromPath(path),
		theme: 'github-dark',
	})

	return { html, skipped: false }
}
