import type { Env } from '~/types/Env'
import { MEET_BASE_PATH, withMeetBasePath } from './meetBasePath'

export interface AuthUser {
	id?: string
	email?: string
	name?: string
	domain?: string
}

export interface AuthSession {
	token?: string
	user: AuthUser
	username: string
}

function getAuthRequestHeaders(request: Request) {
	const headers = new Headers()
	const cookie = request.headers.get('Cookie')
	const authorization = request.headers.get('Authorization')
	if (cookie) headers.set('Cookie', cookie)
	if (authorization) headers.set('Authorization', authorization)
	if (!authorization) {
		const url = new URL(request.url)
		const authToken = url.searchParams.get('auth_token')?.trim()
		if (authToken) headers.set('Authorization', `Bearer ${authToken}`)
	}
	return headers
}

function getUsernameFromAuthUser(user: AuthUser) {
	return user.email || user.name || user.id || null
}

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

function getPostLoginNextUrl(request: Request) {
	const nextUrl = new URL(request.url)
	if (nextUrl.pathname === MEET_BASE_PATH) {
		nextUrl.pathname = `${MEET_BASE_PATH}/`
	}
	for (const param of TRANSIENT_AUTH_PARAMS) {
		nextUrl.searchParams.delete(param)
	}
	return nextUrl.toString()
}

export async function getAuthSession(
	request: Request,
	env?: Pick<Env, 'AUTH_SERVICE'>
): Promise<AuthSession | null> {
	if (!env?.AUTH_SERVICE) return null

	const url = new URL(request.url)
	url.pathname = '/_auth/session'
	url.search = ''

	const response = await env.AUTH_SERVICE.fetch(
		new Request(url.toString(), {
			method: 'GET',
			headers: getAuthRequestHeaders(request),
		})
	)

	if (!response.ok) return null

	const body = (await response.json().catch(() => null)) as {
		authenticated?: boolean
		token?: string
		user?: AuthUser
	} | null

	if (!body?.authenticated || !body.user) return null

	const username = getUsernameFromAuthUser(body.user)
	if (!username) return null

	return {
		token: body.token,
		user: body.user,
		username,
	}
}

export function getLoginUrl(request: Request) {
	const url = new URL(request.url)
	url.pathname = withMeetBasePath('/_auth/login')
	url.search = ''
	url.searchParams.set('next', getPostLoginNextUrl(request))
	return url.toString()
}
