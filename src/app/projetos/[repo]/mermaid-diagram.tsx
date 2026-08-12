'use client'

import { useEffect, useState } from 'react'

export function MermaidDiagram({ code }: { code: string }) {
	const [svg, setSvg] = useState<string | null>(null)
	const [failed, setFailed] = useState(false)

	useEffect(() => {
		let cancelled = false

		async function render() {
			try {
				const mermaid = (await import('mermaid')).default
				mermaid.initialize({ startOnLoad: false, theme: 'dark' })

				const id = `mermaid-${Math.random().toString(36).slice(2)}`
				const { svg: rendered } = await mermaid.render(id, code)

				if (!cancelled) setSvg(rendered)
			} catch {
				if (!cancelled) setFailed(true)
			}
		}

		render()

		return () => {
			cancelled = true
		}
	}, [code])

	if (failed) {
		return (
			<p className="p-4 font-mono text-xs text-muted-foreground">
				Não foi possível renderizar o diagrama.
			</p>
		)
	}

	if (!svg) {
		return <div className="h-32 animate-pulse rounded-[6px] bg-muted" />
	}

	return (
		<div
			className="overflow-x-auto p-4 [&_svg]:mx-auto"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: saída do Mermaid, sanitizada via DOMPurify (securityLevel padrão)
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	)
}
