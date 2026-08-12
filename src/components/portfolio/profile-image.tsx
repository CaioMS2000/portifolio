import Image from 'next/image'
import { imageExists } from '@/utils/image-exists'

export default async function ProfileImage() {
	const imageFlag = await imageExists('images/eu.jpg')

	return (
		<div className="max-w-45 flex-[1_0_160px]">
			{imageFlag ? (
				<Image
					className="h-auto w-full rounded-sm"
					src="/images/eu.jpg"
					alt="Foto de perfil"
					width={160}
					height={180}
				/>
			) : (
				<div
					aria-hidden
					className="flex h-45 w-full items-center justify-center rounded-[6px] bg-muted font-mono text-[11px] text-muted-foreground"
				>
					foto de perfil
				</div>
			)}
		</div>
	)
}
