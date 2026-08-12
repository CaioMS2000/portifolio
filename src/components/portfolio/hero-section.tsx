import { Button } from '@/components/ui/button'
import { profile } from './data'

export function HeroSection() {
	return (
		<section className="flex min-h-[78vh] flex-col justify-center py-10 pb-16">
			<div className="mb-7 flex flex-wrap gap-3 font-mono text-xs">
				<Button
					variant="outline"
					size="sm"
					className="rounded-[4px]"
					nativeButton={false}
					render={<a href={`mailto:${profile.email}`}>email</a>}
				/>
				<Button
					variant="outline"
					size="sm"
					className="rounded-[4px]"
					nativeButton={false}
					render={<a href={profile.githubHref}>github</a>}
				/>
				<Button
					variant="outline"
					size="sm"
					className="rounded-[4px]"
					nativeButton={false}
					render={<a href={profile.linkedinHref}>linkedin</a>}
				/>
			</div>
			<h1 className="text-[clamp(40px,9vw,88px)] leading-[0.98] font-bold tracking-[-0.02em]">
				{profile.firstName}
				<br />
				{profile.lastName}
			</h1>
			<p className="mt-5 font-mono text-[clamp(13px,2vw,16px)] text-primary">
				{profile.role}
			</p>
			<p className="mt-4 max-w-155 text-[clamp(17px,2.4vw,22px)] leading-normal text-foreground/85">
				{profile.intro}
			</p>
		</section>
	)
}
