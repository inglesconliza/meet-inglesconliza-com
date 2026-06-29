import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { nanoid } from 'nanoid'
import { withMeetBasePath } from '~/utils/meetBasePath'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const params = new URL(request.url).searchParams
	// we use this path if someone clicks the link
	// to create a new room before the js has loaded
	const roomName = nanoid(8)
	return redirect(
		withMeetBasePath(`/${roomName}`) +
			(params.size > 0 ? '?' + params.toString() : '')
	)
}
