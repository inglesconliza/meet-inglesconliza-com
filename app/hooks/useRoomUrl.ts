import { useParams } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { withMeetBasePath } from '~/utils/meetBasePath'

export function useRoomUrl() {
	const { roomName } = useParams()
	invariant(roomName)
	if (typeof window === 'undefined') return ''
	const url = new URL(window.location.href)
	url.pathname = withMeetBasePath(`/${roomName}`)
	return url.toString()
}
