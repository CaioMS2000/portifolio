'use server'

import { updateTag } from 'next/cache'

export async function revalidateProjects() {
	updateTag('github-repos')
}
