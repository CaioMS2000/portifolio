import { profile } from './data'
import ProfileImage from './profile-image'

export function AboutSection() {
	return (
		<section className="flex flex-wrap items-start gap-10 border-t border-border py-14 pb-18">
			<div className="flex-[2_1_380px]">
				<div className="mb-6 flex items-baseline gap-2.5">
					<span className="font-mono text-xs text-primary">02</span>
					<h2 className="text-[clamp(24px,3vw,30px)] font-semibold">Sobre</h2>
				</div>
				{profile.bio.map(paragraph => (
					<p
						key={paragraph}
						className="mb-4 text-base leading-[1.7] text-foreground/85"
					>
						{paragraph}
					</p>
				))}
				<p className="font-mono text-[13px] text-muted-foreground">
					{profile.formation}
				</p>
			</div>
			<div className="max-w-45 flex-[1_0_160px]">
				<ProfileImage />
			</div>
		</section>
	)
}
