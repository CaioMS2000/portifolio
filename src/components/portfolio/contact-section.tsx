import { Button } from '@/components/ui/button'
import { profile } from './data'

export function ContactSection() {
	return (
		<section className="border-t border-border py-16 pb-24">
			<div className="mb-6 flex items-baseline gap-2.5">
				<span className="font-mono text-xs text-primary">04</span>
				<h2 className="text-[clamp(24px,3vw,30px)] font-semibold">Contato</h2>
			</div>
			<p className="mb-8 max-w-120 text-[17px] leading-[1.6] text-foreground/85">
				Aberta a conversas sobre novos projetos e oportunidades.
			</p>
			<div className="flex flex-wrap items-center gap-3.5">
				<Button
					variant="outline"
					className="rounded-[4px] font-mono text-sm"
					nativeButton={false}
					render={<a href={`mailto:${profile.email}`}>{profile.email}</a>}
				/>
				<Button
					variant="outline"
					className="rounded-[4px] font-mono text-sm"
					nativeButton={false}
					render={<a href={profile.githubHref}>GitHub</a>}
				/>
				<Button
					variant="outline"
					className="rounded-[4px] font-mono text-sm"
					nativeButton={false}
					render={<a href={profile.linkedinHref}>LinkedIn</a>}
				/>
				<Button
					className="rounded-[4px] font-mono text-sm font-semibold"
					nativeButton={false}
					render={
						<a href={profile.cvHref} download>
							↓ Download CV (PDF)
						</a>
					}
				/>
			</div>
			<p className="mt-16 font-mono text-[11px] text-muted-foreground/60">
				© {profile.copyrightYear} {profile.firstName} {profile.lastName}
			</p>
		</section>
	)
}
