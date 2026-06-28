import { describe, expect, it } from 'vitest'
import { loader } from './root'
import { commitSession, getSession } from './session'

function createAuthService(status = 200) {
	return {
		fetch: async (request: Request) => {
			const url = new URL(request.url)
			if (url.pathname !== '/_auth/session') {
				return Response.json({ authenticated: false }, { status: 404 })
			}

			if (status !== 200) {
				return Response.json({ authenticated: false }, { status })
			}

			return Response.json({
				authenticated: true,
				token: 'test-token',
				user: {
					id: 'email:liza@inglesconliza.com',
					email: 'liza@inglesconliza.com',
					name: 'Liza',
					domain: 'inglesconliza.com',
				},
			})
		},
	} as unknown as Fetcher
}

describe('root loader', () => {
	it('allows a request with a valid shared auth session', async () => {
		const response = await loader({
			request: new Request('https://meet.inglesconliza.com/', {
				headers: { Cookie: 'session_token=test-token' },
			}),
			context: { env: { AUTH_SERVICE: createAuthService() } } as any,
			params: {},
		})

		expect(response.status).toBe(200)
	})

	it('redirects unauthenticated production requests to mounted auth login', async () => {
		let redirect: Response | null = null

		try {
			await loader({
				request: new Request('https://meet.inglesconliza.com/a-room'),
				context: { env: { AUTH_SERVICE: createAuthService(401) } } as any,
				params: {},
			})
		} catch (error) {
			if (!(error instanceof Response)) throw error
			redirect = error
		}

		expect(redirect?.status).toBe(302)
		const location = redirect?.headers.get('Location')
		expect(location).toBe(
			'https://meet.inglesconliza.com/_auth/login?next=https%3A%2F%2Fmeet.inglesconliza.com%2Fa-room'
		)
	})

	it('redirects /set-username to mounted auth when auth service is configured', async () => {
		let redirect: Response | null = null

		try {
			await loader({
				request: new Request('https://meet.inglesconliza.com/set-username'),
				context: { env: { AUTH_SERVICE: createAuthService(401) } } as any,
				params: {},
			})
		} catch (error) {
			if (!(error instanceof Response)) throw error
			redirect = error
		}

		expect(redirect?.status).toBe(302)
		expect(redirect?.headers.get('Location')).toBe(
			'https://meet.inglesconliza.com/_auth/login?next=https%3A%2F%2Fmeet.inglesconliza.com%2Fset-username'
		)
	})

	it('keeps local username fallback when auth service is not configured', async () => {
		const session = await getSession()
		session.set('username', 'Kevin')
		const [Cookie] = await commitSession(session).then((cookie) =>
			cookie.split(';')
		)

		const response = await loader({
			request: new Request('https://meet.inglesconliza.com/', {
				headers: { Cookie },
			}),
			context: { env: {} } as any,
			params: {},
		})

		expect(response.status).toBe(200)
	})

	it('keeps /set-username available for local fallback without auth service', async () => {
		const response = await loader({
			request: new Request('https://meet.inglesconliza.com/set-username'),
			context: { env: {} } as any,
			params: {},
		})

		expect(response.status).toBe(200)
	})
})
