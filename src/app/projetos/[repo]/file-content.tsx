import { getFileContent } from '@/lib/github'
import { highlightCode, isBinaryPath } from '@/lib/highlight'

const MAX_PREVIEW_BYTES = 1_000_000

function UnavailableState({
	message,
	href,
}: {
	message: string
	href: string
}) {
	return (
		<div className="flex flex-col items-start gap-3 p-6 text-sm text-muted-foreground">
			<p>{message}</p>
			<a href={href} className="text-primary hover:underline">
				Ver no GitHub
			</a>
		</div>
	)
}

export async function FileContent({
	repoSlug,
	branch,
	path,
	size,
}: {
	repoSlug: string
	branch: string
	path: string
	size: number | undefined
}) {
	const githubBlobHref = `https://github.com/CaioMS2000/${repoSlug}/blob/${branch}/${path}`

	if (isBinaryPath(path)) {
		return (
			<UnavailableState
				message="Pré-visualização não disponível para este tipo de arquivo."
				href={githubBlobHref}
			/>
		)
	}

	if (size !== undefined && size > MAX_PREVIEW_BYTES) {
		return (
			<UnavailableState
				message="Arquivo grande demais para pré-visualizar aqui."
				href={githubBlobHref}
			/>
		)
	}

	const file = await getFileContent(repoSlug, branch, path)

	if (!file) {
		return (
			<UnavailableState
				message="Não foi possível carregar este arquivo."
				href={githubBlobHref}
			/>
		)
	}

	const { html, skipped } = await highlightCode(file.content, path)

	if (skipped) {
		return (
			<div>
				<p className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
					Arquivo grande — exibindo sem destaque de sintaxe
				</p>
				<pre className="overflow-x-auto p-4 text-[13px] leading-relaxed whitespace-pre-wrap break-words">
					{file.content}
				</pre>
			</div>
		)
	}

	return (
		<div
			className="overflow-x-auto text-[13px] leading-relaxed [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:p-4"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: saída do Shiki, código já escapado por ele
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
