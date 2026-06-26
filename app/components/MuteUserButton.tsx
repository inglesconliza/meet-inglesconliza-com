import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { FC } from 'react'
import { useRoomContext } from '~/hooks/useRoomContext'
import { useUserMetadata } from '~/hooks/useUserMetadata'
import type { ClientMessage, User } from '~/types/Messages'
import AlertDialog from './AlertDialog'
import type { ButtonProps } from './Button'
import { Button } from './Button'
import { Icon } from './Icon/Icon'
import { Tooltip } from './Tooltip'

interface MuteUserButtonProps {
	displayType?: ButtonProps['displayType']
	mutedDisplayType?: ButtonProps['displayType']
	user: User
}

export const MuteUserButton: FC<MuteUserButtonProps> = ({
	user,
	displayType = 'secondary',
	mutedDisplayType = 'danger',
}) => {
	const { room } = useRoomContext()
	const { data } = useUserMetadata(user.name)

	if (user.tracks.audioUnavailable) {
		return (
			<Tooltip content="El micrófono no está disponible. La persona no puede activarlo.">
				<Button disabled displayType="secondary">
					<Icon type="micOff" className="text-red-700 dark:text-red-400" />
					<VisuallyHidden>
						El micrófono de la persona no está disponible.
					</VisuallyHidden>
				</Button>
			</Tooltip>
		)
	}

	return (
		<AlertDialog.Root>
			{user.tracks.audioEnabled ? (
				<Tooltip content={`Silenciar a ${data?.displayName}`}>
					<AlertDialog.Trigger asChild>
						<Button
							displayType={displayType}
							disabled={!user.tracks.audioEnabled}
						>
							<Icon type="micOn" />
						</Button>
					</AlertDialog.Trigger>
				</Tooltip>
			) : (
				<Tooltip content="No se puede activar">
					<Button displayType={mutedDisplayType} disabled>
						<Icon type="micOff" />
					</Button>
				</Tooltip>
			)}

			<AlertDialog.Portal>
				<AlertDialog.Overlay />
				<AlertDialog.Content
					// If we don't prevent the alert from restoring focus the tooltip
					// will continue to show when we don't want it to.
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<AlertDialog.Title>Silenciar a {data?.displayName}</AlertDialog.Title>
					<AlertDialog.Description>
						Tendrá que activar su micrófono para que se le escuche otra vez.
					</AlertDialog.Description>
					<AlertDialog.Actions>
						<AlertDialog.Cancel asChild>
							<Button className="text-sm" displayType="secondary">
								Cancelar
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<Button
								onClick={() => {
									room.websocket.send(
										JSON.stringify({
											type: 'muteUser',
											id: user.id,
										} satisfies ClientMessage)
									)
								}}
								className="text-sm"
								displayType="danger"
							>
								Silenciar
							</Button>
						</AlertDialog.Action>
					</AlertDialog.Actions>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
