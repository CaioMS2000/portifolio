import type { Metadata } from 'next'
import { Roboto_Mono, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const sourceSans = Source_Sans_3({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-sans',
})

const robotoMono = Roboto_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: 'Portifólio - Caio M. S.',
	description: 'Portifólio pessoal de Caio M. S.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang="pt-BR"
			className={cn(
				'dark',
				'h-full',
				'antialiased',
				sourceSans.variable,
				robotoMono.variable
			)}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
