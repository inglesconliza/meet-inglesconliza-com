import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/cloudflare'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import type { FC, ReactNode } from 'react'
import { useRef } from 'react'
import { useFullscreen, useToggle } from 'react-use'

import { QueryClient, QueryClientProvider } from 'react-query'
import tailwind from '~/styles/tailwind.css'
import { getLoginUrl } from './utils/auth.server'
import { elementNotContainedByClickTarget } from './utils/elementNotContainedByClickTarget'
import getUsername from './utils/getUsername.server'
import { stripMeetBasePath, withMeetBasePath } from './utils/meetBasePath'
import { safeRedirect } from './utils/safeReturnUrl'
import { cn } from './utils/style'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const pathname = stripMeetBasePath(url.pathname)
	const username = await getUsername(request, context.env)
	if (!username && (pathname !== '/set-username' || context.env.AUTH_SERVICE)) {
		throw safeRedirect(
			context.env.AUTH_SERVICE
				? getLoginUrl(request)
				: getSetUsernameUrl(request)
		)
	}

	const defaultResponse = json({
		userDirectoryUrl: context.env.USER_DIRECTORY_URL,
	})

	return defaultResponse
}

function getSetUsernameUrl(request: Request) {
	const redirectUrl = new URL(request.url)
	redirectUrl.pathname = withMeetBasePath('/set-username')
	redirectUrl.searchParams.set('return-url', request.url)
	return redirectUrl.toString()
}

export const meta: MetaFunction = () => [
	{
		title: 'InglésConLiza Meet',
	},
]

export const links: LinksFunction = () => [
	{
		rel: 'preconnect',
		href: 'https://fonts.googleapis.com',
	},
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Changa+One&family=Inter:wght@400;500;600;700;800&display=swap',
	},
	{ rel: 'stylesheet', href: tailwind },
	{
		rel: 'apple-touch-icon',
		sizes: '180x180',
		href: withMeetBasePath('/apple-touch-icon.png?v=orange-emoji'),
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '32x32',
		href: withMeetBasePath('/favicon-32x32.png?v=orange-emoji'),
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16',
		href: withMeetBasePath('/favicon-16x16.png?v=orange-emoji'),
	},
	{
		rel: 'manifest',
		href: withMeetBasePath('/site.webmanifest'),
		crossOrigin: 'use-credentials',
	},
	{
		rel: 'mask-icon',
		href: withMeetBasePath('/safari-pinned-tab.svg?v=orange-emoji'),
		color: '#faa339',
	},
	{
		rel: 'shortcut icon',
		href: withMeetBasePath('/favicon.ico?v=orange'),
	},
]

const Document: FC<{ children?: ReactNode }> = ({ children }) => {
	const fullscreenRef = useRef<HTMLBodyElement>(null)
	const [fullscreenEnabled, toggleFullscreen] = useToggle(false)
	useFullscreen(fullscreenRef, fullscreenEnabled, {
		onClose: () => toggleFullscreen(false),
	})
	return (
		// some extensions add data attributes to the html
		// element that React complains about.
		<html className="h-full" lang="es" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="apple-mobile-web-app-title" content="InglésConLiza Meet" />
				<meta name="application-name" content="InglésConLiza Meet" />
				<meta name="msapplication-TileColor" content="#ffffff" />
				<meta
					name="theme-color"
					content="#F5F5F7"
					media="(prefers-color-scheme: light)"
				/>
				<meta
					name="theme-color"
					content="#111421"
					media="(prefers-color-scheme: dark)"
				/>
				<Meta />
				<Links />
			</head>
			<body
				className={cn(
					'h-full',
					'icl-screen',
					'text-zinc-950',
					'dark:text-zinc-100'
				)}
				ref={fullscreenRef}
				onDoubleClick={(e) => {
					if (
						e.target instanceof HTMLElement &&
						!elementNotContainedByClickTarget(e.target)
					)
						toggleFullscreen()
				}}
			>
				{children}
				<ScrollRestoration />
				<div className="hidden" suppressHydrationWarning>
					{/* Replaced in entry.server.ts */}
					__CLIENT_ENV__
				</div>
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export const ErrorBoundary = () => {
	return (
		<Document>
			<div className="grid h-full place-items-center">
				<p>
					It looks like there was an error, but don't worry it has been
					reported. Sorry about that!
				</p>
			</div>
		</Document>
	)
}

const queryClient = new QueryClient()

export default function App() {
	const { userDirectoryUrl } = useLoaderData<typeof loader>()
	return (
		<Document>
			<div id="root" className="h-full bg-inherit isolate">
				<QueryClientProvider client={queryClient}>
					<Outlet
						context={{
							userDirectoryUrl,
						}}
					/>
				</QueryClientProvider>
			</div>
		</Document>
	)
}
