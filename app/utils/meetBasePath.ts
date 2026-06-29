export const MEET_BASE_PATH = '/meet'

export function isMeetPath(pathname: string) {
	return (
		pathname === MEET_BASE_PATH || pathname.startsWith(`${MEET_BASE_PATH}/`)
	)
}

export function stripMeetBasePath(pathname: string) {
	if (pathname === MEET_BASE_PATH) return '/'
	if (pathname.startsWith(`${MEET_BASE_PATH}/`)) {
		return pathname.slice(MEET_BASE_PATH.length) || '/'
	}
	return pathname
}

export function withMeetBasePath(pathname: string) {
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
	if (isMeetPath(normalized)) return normalized
	return normalized === '/'
		? `${MEET_BASE_PATH}/`
		: `${MEET_BASE_PATH}${normalized}`
}
