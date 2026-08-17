import {
	type CvEducationItem,
	type CvExperience,
	cvEducation,
	cvExperience,
	cvProjects,
} from '@/components/portfolio/cv-data'
import { type GithubProject, getPortfolioProjectBySlug } from './github'

export type CvProject = GithubProject & { highlights: string[] }

export type CvData = {
	projects: CvProject[]
	experience: CvExperience[]
	education: CvEducationItem[]
}

export async function getCvData(): Promise<CvData> {
	const projects = await Promise.all(
		cvProjects.map(async entry => {
			const project = await getPortfolioProjectBySlug(entry.repoSlug)

			if (!project) {
				throw new Error(
					`[cv] repoSlug "${entry.repoSlug}" definido em cv-data.ts não corresponde ` +
						'a nenhum repositório GitHub com a topic "portifolio". Verifique o slug ou a topic do repo.'
				)
			}

			return { ...project, highlights: entry.highlights }
		})
	)

	return { projects, experience: cvExperience, education: cvEducation }
}
