import { forwardRef } from 'react'
import { cn } from '~/utils/style'

export const TextArea = forwardRef<
	HTMLTextAreaElement,
	JSX.IntrinsicElements['textarea']
>(({ className, ...rest }, ref) => (
	<textarea
		ref={ref}
		className={cn(
			'bg-white/10 text-white placeholder:text-white/45 text-base border-2 border-white/20 w-full resize-none block p-2 rounded',
			className
		)}
		{...rest}
	/>
))

TextArea.displayName = 'TextArea'
