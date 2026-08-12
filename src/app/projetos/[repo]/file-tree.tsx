'use client'

import { ChevronRight, File, Folder } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { TreeNode } from '@/lib/github'
import { cn } from '@/lib/utils'

function FolderRow({
	node,
	depth,
	selectedPath,
	repoSlug,
}: {
	node: TreeNode
	depth: number
	selectedPath: string | null
	repoSlug: string
}) {
	const containsSelected = Boolean(selectedPath?.startsWith(`${node.path}/`))
	const [open, setOpen] = useState(containsSelected)

	useEffect(() => {
		if (containsSelected) setOpen(true)
	}, [containsSelected])

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<CollapsibleTrigger
				className="group flex w-full items-center gap-1.5 rounded-lg py-1 text-left text-[13px] text-muted-foreground hover:text-foreground"
				style={{ paddingLeft: depth * 14 }}
			>
				<ChevronRight className="size-3.5 shrink-0 transition-transform group-data-panel-open:rotate-90" />
				<Folder className="size-3.5 shrink-0" />
				<span className="truncate">{node.name}</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				{node.children?.map(child => (
					<TreeRow
						key={child.path}
						node={child}
						depth={depth + 1}
						selectedPath={selectedPath}
						repoSlug={repoSlug}
					/>
				))}
			</CollapsibleContent>
		</Collapsible>
	)
}

function TreeRow({
	node,
	depth,
	selectedPath,
	repoSlug,
}: {
	node: TreeNode
	depth: number
	selectedPath: string | null
	repoSlug: string
}) {
	if (node.type === 'folder') {
		return (
			<FolderRow
				node={node}
				depth={depth}
				selectedPath={selectedPath}
				repoSlug={repoSlug}
			/>
		)
	}

	const isActive = node.path === selectedPath

	return (
		<Link
			href={`/projetos/${repoSlug}?file=${encodeURIComponent(node.path)}`}
			className={cn(
				'flex items-center gap-1.5 rounded-lg py-1 text-[13px]',
				isActive
					? 'bg-muted text-foreground'
					: 'text-muted-foreground hover:text-foreground'
			)}
			style={{ paddingLeft: depth * 14 + 20 }}
		>
			<File className="size-3.5 shrink-0" />
			<span className="truncate">{node.name}</span>
		</Link>
	)
}

export function FileTree({
	tree,
	selectedPath,
	repoSlug,
}: {
	tree: TreeNode[]
	selectedPath: string | null
	repoSlug: string
}) {
	return (
		<nav className="font-mono">
			{tree.map(node => (
				<TreeRow
					key={node.path}
					node={node}
					depth={0}
					selectedPath={selectedPath}
					repoSlug={repoSlug}
				/>
			))}
		</nav>
	)
}
