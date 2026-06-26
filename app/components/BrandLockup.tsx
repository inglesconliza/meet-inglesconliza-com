import { cn } from '~/utils/style'

const LOGO_URL =
	'https://media.inglesconliza.com/drive/nodes/file_1a0c6ccd-823b-49a2-b090-3d8cbea4f486/source/inglesconliza-logo.png'

export function BrandLockup({
	className,
	compact = false,
}: {
	className?: string
	compact?: boolean
}) {
	return (
		<div className={cn('flex items-center gap-3', className)}>
			<img
				alt=""
				className={cn(
					'rounded-full shadow-[0_12px_34px_rgba(14,116,247,0.28)]',
					compact ? 'h-11 w-11' : 'h-14 w-14'
				)}
				src={LOGO_URL}
			/>
			<div>
				<div
					className={cn(
						'font-brand leading-none tracking-normal text-white',
						compact ? 'text-3xl' : 'text-4xl'
					)}
				>
					InglésConLiza
				</div>
				<div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/58">
					Meet
				</div>
			</div>
		</div>
	)
}
