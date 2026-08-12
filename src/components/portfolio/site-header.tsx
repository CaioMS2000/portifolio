import { Badge } from '@/components/ui/badge'

export function SiteHeader() {
	return (
		<div className="flex items-center justify-between py-6 font-mono text-xs text-muted-foreground">
			<span>~/portfolio</span>
			{/* decorativo — sem busca real implementada */}
			<Badge
				variant="outline"
				className="gap-1.5 rounded-[4px] px-2 py-[3px] font-mono text-xs font-normal text-muted-foreground"
			>
				<span className="text-foreground">⌘</span>K
				<span className="opacity-60">abrir busca</span>
			</Badge>
		</div>
	)
}
