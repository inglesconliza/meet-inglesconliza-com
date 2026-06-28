import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { routePartykitRequest } from 'partyserver'

import getUsername from '~/utils/getUsername.server'

// handles get requests
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const username = await getUsername(request, context.env)
	if (username === null)
		throw new Response(null, {
			status: 401,
		})
	const partyResponse = await routePartykitRequest(request, context.env)

	return partyResponse || new Response('Not found', { status: 404 })
}
