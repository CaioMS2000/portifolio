import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'

export async function imageExists(imagePath: string) {
	try {
		await access(path.join(process.cwd(), 'public', imagePath), constants.F_OK)
		return true
	} catch {
		return false
	}
}
