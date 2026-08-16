'use client'

import { RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

export function RefreshButton({
	action,
	label = 'Atualizar',
	className,
}: {
	action: () => Promise<void>
	label?: string
	className?: string
}) {
	const [isPending, startTransition] = useTransition()

	return (
		<button
			type="button"
			disabled={isPending}
			onClick={() => startTransition(action)}
			className={cn(
				'flex items-center gap-1.5 hover:text-foreground disabled:opacity-50',
				className
			)}
		>
			<RefreshCw className={cn('size-3.5', isPending && 'animate-spin')} />
			{label}
		</button>
	)
}
