export const SENTRY_DSN =
	// @ts-ignore
	typeof __SENTRY_DSN__ !== 'undefined' ? __SENTRY_DSN__ : undefined

export const RELEASE: string | undefined =
	// @ts-ignore
	typeof __RELEASE__ !== 'undefined' ? __RELEASE__ : undefined
