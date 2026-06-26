import type { LinkProps } from '@remix-run/react'
import { Link } from '@remix-run/react'
import { forwardRef } from 'react'
import { cn } from '~/utils/style'

const displayTypeMap = {
	primary: [
		'text-white',
		'bg-[#0e74f7] hover:bg-[#27328F] active:bg-[#1f2877]',
		'border-[#0e74f7] hover:border-[#27328F] active:border-[#1f2877]',
		'shadow-[0_14px_34px_rgba(14,116,247,0.28)]',
	],
	secondary: [
		'text-white',
		'bg-white/14 hover:bg-white/22 active:bg-white/28',
		'border-white/18 hover:border-white/28',
		'backdrop-blur-xl',
	],
	ghost: [
		'text-white hover:text-white',
		'bg-transparent hover:bg-white/14',
		'border-transparent hover:border-white/18',
	],
	danger: [
		'text-white',
		'bg-red-600 hover:bg-red-700 active:bg-red-800',
		'border-red-600 hover:border-red-700 active:border-red-800',
	],
}

export type ButtonProps = Omit<JSX.IntrinsicElements['button'], 'ref'> & {
	displayType?: keyof typeof displayTypeMap
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, displayType = 'primary', disabled, onClick, ...rest }, ref) => (
		<button
			className={cn(
				'border-4',
				'rounded-full',
				'font-semibold',
				'tracking-normal',
				'py-[.62em] px-[1.15em]',
				'transition-colors',
				disabled && 'cursor-not-allowed opacity-60',
				displayTypeMap[displayType].join(' '),
				className
			)}
			aria-disabled={disabled}
			onClick={disabled ? (e) => e.preventDefault() : onClick}
			{...rest}
			ref={ref}
		/>
	)
)

Button.displayName = 'Button'

export const ButtonLink = forwardRef<
	HTMLAnchorElement,
	LinkProps & {
		displayType?: keyof typeof displayTypeMap
	}
>(({ className, displayType = 'primary', ...rest }, ref) => (
	// eslint-disable-next-line jsx-a11y/anchor-has-content
	<Link
		className={cn(
			'inline-block',
			'border-4',
			'rounded-full',
			'font-semibold',
			'tracking-normal',
			'py-[.62em] px-[1.15em]',
			'transition-colors',
			displayTypeMap[displayType].join(' '),
			className
		)}
		{...rest}
		ref={ref}
	/>
))

ButtonLink.displayName = 'Button'
