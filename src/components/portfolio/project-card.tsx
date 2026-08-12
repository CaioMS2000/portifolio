import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import type { projects } from './data'

export function ProjectCard({
	project,
}: {
	project: (typeof projects)[number]
}) {
	return (
		<Card className="rounded-[6px]">
			<CardHeader>
				<CardTitle className="text-[19px]">{project.name}</CardTitle>
				<CardDescription className="text-[15px] leading-[1.55]">
					{project.desc}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-1.5">
					{project.tags.map(tag => (
						<Badge
							key={tag}
							variant="outline"
							className="rounded-[3px] font-mono text-[11px] font-normal text-muted-foreground"
						>
							{tag}
						</Badge>
					))}
				</div>
			</CardContent>
			<CardFooter className="mt-auto gap-4">
				<Button
					size="sm"
					nativeButton={false}
					render={<a href={project.exploreHref}>Explorar</a>}
				/>
				<a
					href={project.repoHref}
					className="font-mono text-[13px] text-muted-foreground hover:underline"
				>
					Repo
				</a>
				<a
					href={project.demoHref}
					className="font-mono text-[13px] text-muted-foreground hover:underline"
				>
					Demo
				</a>
			</CardFooter>
		</Card>
	)
}
