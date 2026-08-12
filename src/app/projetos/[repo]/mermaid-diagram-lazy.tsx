'use client'

import dynamic from 'next/dynamic'

export const MermaidDiagram = dynamic(
	() => import('./mermaid-diagram').then(m => m.MermaidDiagram),
	{
		ssr: false,
		loading: () => (
			<div className="h-32 animate-pulse rounded-[6px] bg-muted" />
		),
	}
)
