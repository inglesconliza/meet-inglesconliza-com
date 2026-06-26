import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { forwardRef } from 'react'
import { cn } from '~/utils/style'

const Arrow = forwardRef<SVGSVGElement, DropdownMenu.DropdownMenuArrowProps>(
	({ className, ...rest }, ref) => (
		<DropdownMenu.Arrow
			ref={ref}
			className={cn('fill-[#171b2a]', className)}
			{...rest}
		/>
	)
)

Arrow.displayName = 'Arrow'

const Content = forwardRef<
	HTMLDivElement,
	DropdownMenu.DropdownMenuContentProps
>(({ className, ...rest }, ref) => (
	<DropdownMenu.Content
		ref={ref}
		className={cn(
			'bg-[#171b2a]',
			'text-white',
			'border border-white/12',
			'rounded-md',
			'p-1',
			'space-y-1',
			'shadow-lg shadow-black/30',
			'will-change-[opacity,transform]',
			'data-[side=top]:animate-slideDownAndFade',
			'data-[side=right]:animate-slideLeftAndFade',
			'data-[side=bottom]:animate-slideUpAndFade',
			'data-[side=left]:animate-slideRightAndFade',
			className
		)}
		{...rest}
	/>
))

Content.displayName = 'Content'

const Item = forwardRef<HTMLDivElement, DropdownMenu.DropdownMenuItemProps>(
	({ className, ...rest }, ref) => (
		<DropdownMenu.Item
			ref={ref}
			className={cn(
				'group',
				'text-base',
				'leading-none',
				'text-white/86',
				'rounded',
				'flex',
				'items-center',
				'h-6',
				'py-6 md:py-5',
				'relative',
				'px-4',
				'select-none',
				'outline-none',
				'data-[disabled]:text-white/34',
				'data-[disabled]:cursor-not-allowed',
				'data-[highlighted]:bg-orange-500',
				'data-[highlighted]:text-white',
				className
			)}
			{...rest}
		/>
	)
)

Item.displayName = 'Item'

export default {
	...DropdownMenu,
	Arrow,
	Content,
	Item,
}
