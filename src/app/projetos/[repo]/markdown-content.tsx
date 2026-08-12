import type { ReactElement, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { highlightCode } from '@/lib/highlight'
import { MermaidDiagram } from './mermaid-diagram-lazy'

async function CodeBlock({ children }: { children?: ReactNode }) {
	const codeElement = children as ReactElement<{
		className?: string
		children?: unknown
	}>
	const lang =
		(codeElement.props.className ?? '').replace('language-', '') || 'text'
	const code = String(codeElement.props.children ?? '').replace(/\n$/, '')

	if (lang === 'mermaid') {
		return <MermaidDiagram code={code} />
	}

	const { html } = await highlightCode(code, lang)

	return (
		<div
			className="overflow-x-auto text-[13px] leading-relaxed [&_pre]:whitespace-pre-wrap [&_pre]:wrap-break-word [&_pre]:p-4"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: saída do Shiki, código já escapado por ele
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}

export function MarkdownContent({ content }: { content: string }) {
	return (
		<div className="p-6 text-[15px] leading-relaxed text-foreground">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					pre: CodeBlock,
					code: ({ children, className }) =>
						className ? (
							<code className={className}>{children}</code>
						) : (
							<code className="rounded-lg bg-muted px-1 py-0.5 font-mono text-[13px] text-foreground">
								{children}
							</code>
						),
					h1: ({ children }) => (
						<h1 className="mt-8 mb-4 text-2xl font-semibold text-foreground first:mt-0">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="mt-8 mb-3 text-xl font-semibold text-foreground first:mt-0">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="mt-6 mb-2 text-base font-semibold text-foreground">
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className="mb-4 text-muted-foreground">{children}</p>
					),
					a: ({ children, href }) => (
						<a href={href} className="text-primary hover:underline">
							{children}
						</a>
					),
					ul: ({ children }) => (
						<ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="mb-4 list-decimal space-y-1 pl-6 text-muted-foreground">
							{children}
						</ol>
					),
					li: ({ children }) => <li>{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="mb-4 border-l-2 border-border pl-4 text-muted-foreground italic">
							{children}
						</blockquote>
					),
					hr: () => <hr className="my-6 border-border" />,
					strong: ({ children }) => (
						<strong className="font-semibold text-foreground">
							{children}
						</strong>
					),
					em: ({ children }) => <em className="italic">{children}</em>,
					table: ({ children }) => (
						<div className="mb-4 overflow-x-auto">
							<table className="w-full border-collapse text-left text-sm">
								{children}
							</table>
						</div>
					),
					th: ({ children }) => (
						<th className="border-b border-border px-3 py-2 font-mono text-xs text-muted-foreground">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="border-b border-border px-3 py-2 text-muted-foreground">
							{children}
						</td>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}
