import path from 'node:path'
import { Font } from '@react-pdf/renderer'

const FONTS_DIR = path.join(__dirname, 'fonts')

export const FONT_FAMILY = 'Fira Sans'

Font.register({
	family: FONT_FAMILY,
	fonts: [
		{ src: path.join(FONTS_DIR, 'FiraSans-Regular.ttf'), fontWeight: 400 },
		{ src: path.join(FONTS_DIR, 'FiraSans-Bold.ttf'), fontWeight: 700 },
	],
})

// O dicionário de hifenização padrão do react-pdf é em inglês e quebra
// palavras em português de forma errada nas bordas de linha — desligado aqui.
Font.registerHyphenationCallback(word => [word])
