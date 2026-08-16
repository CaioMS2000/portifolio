'use client'

import { RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { revalidateProject } from './actions'

export function RefreshButton({ repoSlug }: { repoSlug: string }) {
	const [isPending, startTransition] = useTransition()

	return (
		<button
			type="button"
			disabled={isPending}
			onClick={() => startTransition(() => revalidateProject(repoSlug))}
			className="flex items-center gap-1.5 hover:text-foreground disabled:opacity-50"
		>
			<RefreshCw className={cn('size-3.5', isPending && 'animate-spin')} />
			Atualizar
		</button>
	)
}
