import { RefreshButton } from '@/components/refresh-button'
import { getPortfolioProjects } from '@/lib/github'
import { revalidateProjects } from './actions'
import { ProjectCard } from './project-card'

export async function ProjectsSection() {
	const projects = await getPortfolioProjects()

	if (projects.length === 0) return null

	return (
		<section className="border-t border-border py-14 pb-18">
			<div className="mb-10 flex items-baseline justify-between gap-2.5">
				<div className="flex items-baseline gap-2.5">
					<span className="font-mono text-xs text-primary">01</span>
					<h2 className="text-[clamp(24px,3vw,30px)] font-semibold">
						Projetos em destaque
					</h2>
				</div>
				<RefreshButton
					action={revalidateProjects}
					className="font-mono text-xs text-muted-foreground"
				/>
			</div>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
				{projects.map(project => (
					<ProjectCard key={project.name} project={project} />
				))}
			</div>
		</section>
	)
}
