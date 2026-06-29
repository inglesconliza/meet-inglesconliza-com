import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { FC } from 'react'
import { withMeetBasePath } from '~/utils/meetBasePath'
import { Button } from './Button'
import { Icon } from './Icon/Icon'
import { Tooltip } from './Tooltip'

interface LeaveRoomButtonProps {
	navigateToFeedbackPage: boolean
	meetingId?: string
}

export const LeaveRoomButton: FC<LeaveRoomButtonProps> = ({
	navigateToFeedbackPage,
	meetingId,
}) => {
	return (
		<Tooltip content="Salir">
			<Button
				displayType="danger"
				onClick={() => {
					const params = new URLSearchParams()
					if (meetingId) params.set('meetingId', meetingId)
					window.location.assign(
						navigateToFeedbackPage
							? withMeetBasePath(`/call-quality-feedback?${params}`)
							: withMeetBasePath('/')
					)
				}}
			>
				<VisuallyHidden>Salir</VisuallyHidden>
				<Icon type="phoneXMark" />
			</Button>
		</Tooltip>
	)
}
