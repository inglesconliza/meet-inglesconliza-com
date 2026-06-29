import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { routePartyTracksRequest } from 'partytracks/server'

const proxy = async ({ request, context }: LoaderFunctionArgs) =>
	routePartyTracksRequest({
		appId: context.env.CALLS_APP_ID,
		token: context.env.CALLS_APP_SECRET,
		realtimeApiBaseUrl: context.env.CALLS_API_URL,
		prefix: '/meet/partytracks',
		request,
	})

export const loader = proxy
export const action = proxy
