import { AboutSection } from '@/components/portfolio/about-section'
import { ContactSection } from '@/components/portfolio/contact-section'
import { HeroSection } from '@/components/portfolio/hero-section'
import { ProjectsSection } from '@/components/portfolio/projects-section'
import { SiteHeader } from '@/components/portfolio/site-header'
import { StackSection } from '@/components/portfolio/stack-section'

export default function Home() {
	return (
		<div className="mx-auto max-w-275 px-5">
			<SiteHeader />
			<HeroSection />
			<ProjectsSection />
			<AboutSection />
			<StackSection />
			<ContactSection />
		</div>
	)
}
