import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { flattenFiles, getRepoDetail, getRepoTree } from '@/lib/github'
import { FileContent } from './file-content'
import { FileTree } from './file-tree'

export default async function ProjectRepoPage({
	params,
	searchParams,
}: PageProps<'/projetos/[repo]'>) {
	const { repo } = await params
	const { file } = await searchParams

	const detail = await getRepoDetail(repo)
	if (!detail) notFound()

	const { tree } = await getRepoTree(repo, detail.defaultBranch)
	const files = flattenFiles(tree)

	const selectedFile =
		(typeof file === 'string' && files.find(f => f.path === file)) ||
		files.find(f => f.path.toLowerCase() === 'readme.md') ||
		null

	return (
		<div className="mx-auto max-w-275 px-5">
			<div className="flex items-center gap-2.5 border-b border-border py-6 font-mono text-xs text-muted-foreground">
				<a href="/" className="hover:text-foreground">
					~/portfolio
				</a>
				<span>/</span>
				<span className="text-foreground">{detail.name}</span>
			</div>

			<div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[280px_1fr]">
				<FileTree
					tree={tree}
					selectedPath={selectedFile?.path ?? null}
					repoSlug={repo}
				/>
				<div className="min-h-100 rounded-[6px] border border-border bg-card">
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
