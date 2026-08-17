import { Document, Link, Page, Text, View } from '@react-pdf/renderer'
import { profile, stackGroups } from '@/components/portfolio/data'
import type { CvData } from '@/lib/cv'
import './fonts'
import { styles } from './styles'

export function CvDocument({ data }: { data: CvData }) {
	const contactLinks = [
		{ label: 'Portfólio', href: profile.siteUrl },
		{ label: 'Email', href: `mailto:${profile.email}` },
		{ label: 'GitHub', href: profile.githubHref },
		{ label: 'LinkedIn', href: profile.linkedinHref },
	].filter(link => Boolean(link.href) && link.href !== 'mailto:')

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.name}>
						{profile.firstName} {profile.lastName}
					</Text>
					<Text style={styles.role}>{profile.role}</Text>
					{contactLinks.length > 0 && (
						<Text style={styles.contactLine}>
							{contactLinks.map((link, i) => (
								<Text key={link.label}>
									{i > 0 && '  ·  '}
									<Link src={link.href} style={styles.contactLink}>
										{link.label}
									</Link>
								</Text>
							))}
						</Text>
					)}
				</View>

				<Text style={styles.summary}>{profile.intro}</Text>

				{data.projects.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Projetos</Text>
						{data.projects.map(project => (
							<View key={project.slug} style={styles.projectItem}>
								<Text style={styles.projectName}>{project.name}</Text>
								{project.desc && (
									<Text style={styles.projectDesc}>{project.desc}</Text>
								)}
								{project.tags.length > 0 && (
									<Text style={styles.projectTags}>
										{project.tags.join(' · ')}
									</Text>
								)}
								{project.highlights.map(highlight => (
									<Text key={highlight} style={styles.bullet}>
										• {highlight}
									</Text>
								))}
							</View>
						))}
					</View>
				)}

				{stackGroups.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Stack</Text>
						{stackGroups.map(group => (
							<Text key={group.label} style={styles.stackLine}>
								<Text style={styles.stackLabel}>{group.label}: </Text>
								{group.items.join(', ')}
							</Text>
						))}
					</View>
				)}

				{data.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Experiência</Text>
						{data.experience.map(exp => (
							<View key={`${exp.company}-${exp.role}`} style={styles.expItem}>
								<Text style={styles.expHeader}>
									{exp.role} — {exp.company} ({exp.period})
								</Text>
								{exp.bullets.map(bullet => (
									<Text key={bullet} style={styles.bullet}>
										• {bullet}
									</Text>
								))}
							</View>
						))}
					</View>
				)}

				{data.education.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Formação</Text>
						{data.education.map(edu => (
							<Text
								key={`${edu.title}-${edu.institution}`}
								style={styles.eduLine}
							>
								{edu.title} — {edu.institution}
								{edu.period ? `, ${edu.period}` : ''}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	)
}
