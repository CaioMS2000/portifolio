import path from 'node:path'
import { renderToFile } from '@react-pdf/renderer'
import { getCvData } from '../src/lib/cv'
import { CvDocument } from './cv-pdf/cv-document'

async function main() {
	const data = await getCvData()
	const outputPath = path.join(process.cwd(), 'public', 'cv.pdf')

	await renderToFile(<CvDocument data={data} />, outputPath)

	console.log(`[generate-cv] CV gerado em ${outputPath}`)
}

main().catch(err => {
	console.error('[generate-cv] Falha ao gerar o CV em PDF:', err)
	process.exit(1)
})
