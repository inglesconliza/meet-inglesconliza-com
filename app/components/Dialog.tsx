import * as RadixDialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { forwardRef } from 'react'
import { cn, style } from '~/utils/style'

export const DialogOverlay = style(
	RadixDialog.DialogOverlay,
	'fixed inset-0 bg-black opacity-40'
)

export const DialogContent = forwardRef<
	HTMLDivElement,
	RadixDialog.DialogContentProps
>((props, ref) => (
	<RadixDialog.DialogContent
		ref={ref}
		className={cn(
			'fixed',
			'rounded-lg',
			'top-1/2',
			'left-1/2',
			'-translate-x-1/2',
			'-translate-y-1/2',
			'min-w-[min(400px,95vw)]',
			'max-w-[95vw]',
			'max-h-[85vh]',
			'overflow-y-auto',
			'p-6',
			'bg-[#171b2a]',
			'text-white',
			'border',
			'border-white/12',
			'shadow-xl shadow-black/30'
		)}
	>
		{props.children}
		<DialogClose />
	</RadixDialog.DialogContent>
))

DialogContent.displayName = 'DialogContent'

export const DialogTitle = style(
	RadixDialog.Title,
	'font-bold text-xl text-white'
)

const DialogClose = () => (
	<RadixDialog.Close className="absolute top-0 right-0 m-4 rounded-full h-8 w-8 text-white/72 hover:bg-white/10 hover:text-white">
		<VisuallyHidden>Cerrar</VisuallyHidden>
		<span
			className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
			aria-hidden
		>
			×
		</span>
	</RadixDialog.Close>
)

export const Dialog = RadixDialog.Root
export const Trigger = RadixDialog.Trigger
export const Portal = ({
	container: _container,
	...rest
}: React.ComponentProps<typeof RadixDialog.Portal>) => (
	<RadixDialog.Portal
		container={
			typeof document !== 'undefined'
				? document.getElementById('root')
				: undefined
		}
		{...rest}
	/>
)

export const Description = style(
	RadixDialog.Description,
	'text-sm text-white/72'
)
