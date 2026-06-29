// @ts-ignore
import {
	getAssetFromKV,
	MethodNotAllowedError,
	NotFoundError,
} from '@cloudflare/kv-asset-handler'
import type { AppLoadContext, ServerBuild } from '@remix-run/cloudflare'
import { createRequestHandler } from '@remix-run/cloudflare'
import * as build from '@remix-run/dev/server-build'
// @ts-expect-error
import manifestJSON from '__STATIC_CONTENT_MANIFEST'
import {
	isMeetPath,
	MEET_BASE_PATH,
	stripMeetBasePath,
	withMeetBasePath,
} from '~/utils/meetBasePath'
import { mode } from '~/utils/mode'
import { queue } from './app/queue'

import type { Env } from '~/types/Env'

const serverBuild = { ...build, basename: MEET_BASE_PATH }
const baseRemixHandler = createRequestHandler(serverBuild, mode)

export const remixHandler = (request: Request, env: AppLoadContext) => {
	return baseRemixHandler(request, { ...env, mode })
}

const notImplemented = () => {
	throw new Error('Not implemented')
}

export const createKvAssetHandler = (ASSET_MANIFEST: Record<string, string>) =>
	async function handleAsset(
		request: Request,
		env: any,
		ctx: any,
		build: ServerBuild
	) {
		const ASSET_NAMESPACE = env.__STATIC_CONTENT

		// Apparently it's fine to fake this event to use with modules format
		// https://github.com/cloudflare/kv-asset-handler#es-modules
		const event = Object.assign(new Event('fetch'), {
			request,
			waitUntil(promise: Promise<unknown>) {
				return ctx.waitUntil(promise)
			},
			// These shouldn't be used
			respondWith: notImplemented,
			passThroughOnException: notImplemented,
		})

		try {
			if (mode === 'development') {
				return await getAssetFromKV(event, {
					cacheControl: {
						bypassCache: true,
					},
					ASSET_MANIFEST,
					ASSET_NAMESPACE,
				})
			}

			let cacheControl = {}
			let url = new URL(event.request.url)
			let assetpath = build.assets.url.split('/').slice(0, -1).join('/')
			let requestpath = url.pathname.split('/').slice(0, -1).join('/')

			if (requestpath.startsWith(assetpath)) {
				// Assets are hashed by Remix so are safe to cache in the browser
				// And they're also hashed in KV storage, so are safe to cache on the edge
				cacheControl = {
					bypassCache: false,
					edgeTTL: 31536000,
					browserTTL: 31536000,
				}
			} else {
				// Assets are not necessarily hashed in the request URL, so we cannot cache in the browser
				// But they are hashed in KV storage, so we can cache on the edge
				cacheControl = {
					bypassCache: false,
					edgeTTL: 31536000,
				}
			}

			return await getAssetFromKV(event, {
				cacheControl,
				ASSET_MANIFEST,
				ASSET_NAMESPACE,
			})
		} catch (error) {
			if (
				error instanceof MethodNotAllowedError ||
				error instanceof NotFoundError
			) {
				return null
			}

			throw error
		}
	}

export { ChatRoom } from './app/durableObjects/ChatRoom.server'
export { queue } from './app/queue'

const kvAssetHandler = createKvAssetHandler(JSON.parse(manifestJSON))

const TRANSIENT_AUTH_PARAMS = [
	'index',
	'auth_success',
	'auth_error',
	'error_message',
	'user_email',
	'user_name',
	'user_id',
	'auth_token',
]

function hasTransientAuthParams(url: URL) {
	return TRANSIENT_AUTH_PARAMS.some((param) => url.searchParams.has(param))
}

function getRedirectToMeetUrl(request: Request) {
	const url = new URL(request.url)
	url.protocol = 'https:'
	url.hostname = 'www.inglesconliza.com'
	url.pathname = withMeetBasePath(url.pathname)
	return url.toString()
}

function stripMeetPrefixFromRequest(request: Request) {
	const url = new URL(request.url)
	url.pathname = stripMeetBasePath(url.pathname)
	return new Request(url.toString(), request)
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url)
		if (
			url.hostname === 'meet.inglesconliza.com' ||
			url.hostname === 'meet.inglesconlizxa.com'
		) {
			return Response.redirect(getRedirectToMeetUrl(request), 301)
		}

		if (
			url.pathname === '/health' ||
			url.pathname === withMeetBasePath('/health')
		) {
			return Response.json({
				status: 'ok',
				branch: env.DEPLOY_BRANCH ?? 'unknown',
				commitHash: env.DEPLOY_COMMIT_HASH ?? 'unknown',
				deployedAt: env.DEPLOYED_AT ?? 'unknown',
			})
		}

		if (url.pathname === MEET_BASE_PATH) {
			return Response.redirect(
				new URL(`${MEET_BASE_PATH}/`, url).toString(),
				301
			)
		}
		if (url.pathname === `${MEET_BASE_PATH}/` && hasTransientAuthParams(url)) {
			const cleanUrl = new URL(`${MEET_BASE_PATH}/`, url)
			return Response.redirect(cleanUrl.toString(), 302)
		}
		if (!isMeetPath(url.pathname)) {
			return new Response('Not found', { status: 404 })
		}

		const pathWithoutBase = stripMeetBasePath(url.pathname)
		if (pathWithoutBase === '/_auth' || pathWithoutBase.startsWith('/_auth/')) {
			if (!env.AUTH_SERVICE) {
				return new Response('Auth service is not configured', { status: 503 })
			}
			return env.AUTH_SERVICE.fetch(stripMeetPrefixFromRequest(request))
		}

		const assetResponse = await kvAssetHandler(
			stripMeetPrefixFromRequest(request),
			env,
			ctx,
			serverBuild
		)
		if (assetResponse) return assetResponse
		return remixHandler(request, { env, mode })
	},
	queue,
}
