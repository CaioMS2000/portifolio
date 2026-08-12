import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="mx-auto max-w-275 px-5 py-24 text-center">
			<p className="mb-2 font-mono text-xs text-primary">404</p>
			<h1 className="mb-4 text-2xl font-semibold">Projeto não encontrado</h1>
			<p className="mb-8 text-muted-foreground">
				Esse repositório não existe ou não está marcado como projeto do
				portfólio.
			</p>
			<Link href="/" className="text-primary hover:underline">
				Voltar para o início
			</Link>
		</div>
	)
}
