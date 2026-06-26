import type { FC } from 'react'
import { cn } from '~/utils/style'

interface DisclaimerProps {
	className?: string
}

export const Disclaimer: FC<DisclaimerProps> = ({ className }) => {
	return (
		<p
			className={cn(
				'text-xs text-zinc-400 dark:text-zinc-500 max-w-prose',
				className
			)}
		>
			InglésConLiza Meet funciona con{' '}
			<a className="underline" href="https://developers.cloudflare.com/calls/">
				Cloudflare Calls
			</a>
			. Para crear tu propia aplicación WebRTC con Cloudflare Calls, empieza en
			el{' '}
			<a
				className="underline"
				href="https://dash.cloudflare.com/?to=/:account/calls"
			>
				panel de Cloudflare
			</a>
			.
		</p>
	)
}
