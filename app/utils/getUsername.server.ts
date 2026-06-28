import { commitSession, getSession } from '~/session'
import type { Env } from '~/types/Env'
import { getAuthSession } from './auth.server'
import { safeRedirect } from './safeReturnUrl'

export async function setUsername(
	username: string,
	request: Request,
	returnUrl: string = '/'
) {
	const session = await getSession(request.headers.get('Cookie'))
	session.set('username', username)
	throw safeRedirect(returnUrl, {
		headers: {
			'Set-Cookie': await commitSession(session),
		},
	})
}

/**
 * Utility for getting the username. Production uses the shared
 * InglésConLiza auth session. Local development can still fall back
 * to the local username cookie.
 */
export default async function getUsername(request: Request, env?: Env) {
	const authSession = await getAuthSession(request, env)
	if (authSession) return authSession.username

	const session = await getSession(request.headers.get('Cookie'))
	const sessionUsername = session.get('username')
	if (typeof sessionUsername === 'string') return sessionUsername

	return null
}
