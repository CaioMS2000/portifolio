import { stackGroups } from './data'

export function StackSection() {
	return (
		<section className="border-t border-border py-14 pb-18">
			<div className="mb-8 flex items-baseline gap-2.5">
				<span className="font-mono text-xs text-primary">03</span>
				<h2 className="text-[clamp(24px,3vw,30px)] font-semibold">Stack</h2>
			</div>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-7">
				{stackGroups.map(group => (
					<div key={group.label}>
						<p className="mb-3 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
							{group.label}
						</p>
						<div className="flex flex-col gap-2">
							{group.items.map(item => (
								<span key={item} className="text-[15px] text-foreground/85">
									{item}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
