import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { routePartykitRequest } from 'partyserver'

import getUsername from '~/utils/getUsername.server'
import { stripMeetBasePath } from '~/utils/meetBasePath'

function stripMeetPrefixFromRequest(request: Request) {
	const url = new URL(request.url)
	url.pathname = stripMeetBasePath(url.pathname)
	return new Request(url.toString(), request)
}

// handles get requests
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const username = await getUsername(request, context.env)
	if (username === null)
		throw new Response(null, {
			status: 401,
		})
	const partyResponse = await routePartykitRequest(
		stripMeetPrefixFromRequest(request),
		context.env
	)

	return partyResponse || new Response('Not found', { status: 404 })
}
