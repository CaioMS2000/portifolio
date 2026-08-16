import { SiGithub } from '@icons-pack/react-simple-icons'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { flattenFiles, getRepoDetail, getRepoTree } from '@/lib/github'
import { FileContent } from '../file-content'
import { FileTree } from '../file-tree'
import { RefreshButton } from '../refresh-button'

export default async function ProjectRepoPage({
	params,
}: PageProps<'/projetos/[repo]/[[...file]]'>) {
	const { repo, file } = await params
	const requestedPath = file?.join('/')

	const detail = await getRepoDetail(repo)
	if (!detail) notFound()

	const { tree } = await getRepoTree(repo, detail.defaultBranch)
	const files = flattenFiles(tree)

	const selectedFile =
		(requestedPath && files.find(f => f.path === requestedPath)) ||
		files.find(f => f.path.toLowerCase() === 'readme.md') ||
		null

	return (
		<div className="flex h-dvh flex-col px-5">
			<div className="flex shrink-0 items-center justify-between gap-2.5 border-b border-border py-6 font-mono text-xs text-muted-foreground">
				<div className="flex items-center gap-2.5">
					<a href="/" className="hover:text-foreground">
						~/portfolio
					</a>
					<span>/</span>
					<span className="text-foreground">{detail.name}</span>
				</div>
				<div className="flex items-center gap-4">
					<RefreshButton repoSlug={repo} />
					<a
						href={detail.repoHref}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 hover:text-foreground hover:underline"
					>
						<SiGithub className="size-3.5" color="currentColor" />
						Ver no GitHub
					</a>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-6 py-8 md:flex-row">
				<FileTree
					tree={tree}
					selectedPath={selectedFile?.path ?? null}
					repoSlug={repo}
				/>
				<div className="min-h-0 flex-1 overflow-y-auto rounded-[6px] border border-border bg-card">
					<Suspense
						key={selectedFile?.path ?? 'none'}
						fallback={
							<div className="p-6 text-sm text-muted-foreground">
								Carregando…
							</div>
						}
					>
						{selectedFile ? (
							<FileContent
								repoSlug={repo}
								branch={detail.defaultBranch}
								path={selectedFile.path}
								size={selectedFile.size}
							/>
						) : (
							<p className="p-6 text-sm text-muted-foreground">
								Selecione um arquivo à esquerda para visualizar seu conteúdo.
							</p>
						)}
					</Suspense>
				</div>
			</div>
		</div>
	)
}
