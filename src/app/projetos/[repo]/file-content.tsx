import { getFileContent } from '@/lib/github'
import {
	getLanguageFromPath,
	highlightCode,
	isBinaryPath,
	isMarkdownPath,
} from '@/lib/highlight'
import { MarkdownContent } from './markdown-content'

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
	commitSha,
	path,
	size,
}: {
	repoSlug: string
	branch: string
	commitSha: string
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

	const file = await getFileContent(repoSlug, commitSha, path)

	if (!file) {
		return (
			<UnavailableState
				message="Não foi possível carregar este arquivo."
				href={githubBlobHref}
			/>
		)
	}

	if (isMarkdownPath(path)) {
		return (
			<MarkdownContent content={file.content} repoSlug={repoSlug} path={path} />
		)
	}

	const { html, skipped } = await highlightCode(
		file.content,
		getLanguageFromPath(path)
	)

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
			className="overflow-x-auto text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:p-4"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: saída do Shiki, código já escapado por ele
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
