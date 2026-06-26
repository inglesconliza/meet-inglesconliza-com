import { forwardRef } from 'react'
import { cn } from '~/utils/style'

export const Input = forwardRef<
	HTMLInputElement,
	JSX.IntrinsicElements['input']
>(({ className, ...rest }, ref) => (
	<input
		className={cn(
			'w-full',
			'rounded-2xl',
			'border',
			'border-white/20',
			'text-white',
			'placeholder:text-white/45',
			'[background:rgba(255,255,255,0.12)]',
			'px-4',
			'py-3',
			'outline-none',
			'backdrop-blur-xl',
			'focus:border-white/40',
			className
		)}
		{...rest}
		ref={ref}
	/>
))

Input.displayName = 'Input'
