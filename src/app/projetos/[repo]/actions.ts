'use server'

import { updateTag } from 'next/cache'

export async function revalidateProject(repoSlug: string) {
	updateTag(`github-repo-${repoSlug}`)
}
