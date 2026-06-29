import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import { nanoid } from 'nanoid'
import invariant from 'tiny-invariant'
import { BrandLockup } from '~/components/BrandLockup'
import { Button, ButtonLink } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { useUserMetadata } from '~/hooks/useUserMetadata'
import { getAuthSession } from '~/utils/auth.server'
import getUsername from '~/utils/getUsername.server'
import { withMeetBasePath } from '~/utils/meetBasePath'

type SpeakingSlot = {
	id: string
	day_of_week: number
	start_time: string
	end_time: string
	teacher_name: string
	level: string
	timezone?: string
	is_enrolled?: boolean
	next_occurrence_starts_at?: string
	next_occurrence_ends_at?: string
	join_available_at?: string
	can_join_now?: boolean
}

type ReservedSession = {
	id: string
	teacherName: string
	levelLabel: string
	startsAt: string
	startLabel: string
	timeLabel: string
	joinAvailableLabel: string
	canJoinNow: boolean
}

const API_ORIGIN_FALLBACK = 'https://api.inglesconliza.com'

function getApiOrigin(context: LoaderFunctionArgs['context']) {
	return context.env.INGLES_CON_LIZA_API_ORIGIN?.trim() || API_ORIGIN_FALLBACK
}

function getLevelLabel(level: string) {
	const normalized = level.trim().toLowerCase()
	if (normalized === 'basico') return 'Básico'
	if (normalized === 'intermedio') return 'Intermedio'
	if (normalized === 'all') return 'Todos los niveles'
	return level || 'Speaking'
}

function formatDateTime(value?: string) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''
	return new Intl.DateTimeFormat('es-PY', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

function formatTimeRange(startsAt?: string, endsAt?: string) {
	const start = startsAt ? new Date(startsAt) : null
	const end = endsAt ? new Date(endsAt) : null
	if (
		!start ||
		!end ||
		Number.isNaN(start.getTime()) ||
		Number.isNaN(end.getTime())
	) {
		return ''
	}
	const formatter = new Intl.DateTimeFormat('es-PY', {
		hour: '2-digit',
		minute: '2-digit',
	})
	return `${formatter.format(start)} - ${formatter.format(end)}`
}

function mapReservedSession(slot: SpeakingSlot): ReservedSession {
	return {
		id: slot.id,
		teacherName: slot.teacher_name,
		levelLabel: getLevelLabel(slot.level),
		startsAt: slot.next_occurrence_starts_at ?? '',
		startLabel: formatDateTime(slot.next_occurrence_starts_at),
		timeLabel: formatTimeRange(
			slot.next_occurrence_starts_at,
			slot.next_occurrence_ends_at
		),
		joinAvailableLabel: formatDateTime(slot.join_available_at),
		canJoinNow: Boolean(slot.can_join_now),
	}
}

async function loadReservedSessions(
	request: Request,
	context: LoaderFunctionArgs['context']
) {
	const session = await getAuthSession(request, context.env)
	if (!session?.token) return { sessions: [], error: null }

	const response = await fetch(`${getApiOrigin(context)}/api/speaking/slots`, {
		headers: {
			Authorization: `Bearer ${session.token}`,
		},
	})

	if (!response.ok) {
		return {
			sessions: [],
			error: 'No pudimos cargar tus próximas sesiones reservadas.',
		}
	}

	const payload = (await response.json().catch(() => null)) as {
		slots?: SpeakingSlot[]
	} | null

	const sessions = (payload?.slots ?? [])
		.filter((slot) => slot.is_enrolled)
		.map(mapReservedSession)
		.sort((a, b) => {
			return a.startsAt.localeCompare(b.startsAt)
		})

	return { sessions, error: null }
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const directoryUrl = context.env.USER_DIRECTORY_URL
	const username = await getUsername(request, context.env)
	invariant(username)
	const reservedSessions = await loadReservedSessions(request, context)
	return json({ username, directoryUrl, reservedSessions })
}

export const action: ActionFunction = async ({ request, context }) => {
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'join-speaking-session') {
		const slotId = formData.get('slotId')
		invariant(typeof slotId === 'string')
		const session = await getAuthSession(request, context.env)
		if (!session?.token) {
			return json(
				{ error: 'Tu sesión expiró. Inicia sesión nuevamente para entrar.' },
				{ status: 401 }
			)
		}

		const response = await fetch(
			`${getApiOrigin(context)}/api/speaking/slots/${encodeURIComponent(slotId)}/join`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.token}`,
				},
			}
		)
		const payload = (await response.json().catch(() => null)) as {
			meet_url?: string
			error?: string
		} | null

		if (!response.ok || !payload?.meet_url) {
			return json(
				{
					error:
						payload?.error ||
						'No pudimos abrir el enlace de esta sesión todavía.',
				},
				{ status: response.status || 400 }
			)
		}

		return redirect(payload.meet_url)
	}

	const room = formData.get('room')
	invariant(typeof room === 'string')
	return redirect(
		withMeetBasePath(`/${room.replace(/ /g, '-').replace(/^\/+/, '')}`)
	)
}

export default function Index() {
	const { username, reservedSessions } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>() as
		| { error?: string }
		| undefined
	const navigate = useNavigate()
	const { data } = useUserMetadata(username)
	const displayName = data?.displayName?.trim()
	const hasDistinctDisplayName = displayName && displayName !== username

	return (
		<div className="grid min-h-full place-items-center px-4 py-8">
			<div className="w-full max-w-2xl rounded-[24px] p-5 text-white icl-panel sm:p-6">
				<div>
					<BrandLockup />
					<div className="flex items-center justify-between gap-3">
						<p className="mt-5 text-sm text-white/64">
							Sesión iniciada como{' '}
							{hasDistinctDisplayName ? (
								<>
									<span className="font-semibold text-white/82">
										{displayName}
									</span>{' '}
									<span>{username}</span>
								</>
							) : (
								<span>{username}</span>
							)}
						</p>
					</div>
				</div>
				<div className="mt-7 rounded-[18px] border border-white/14 bg-white/[0.07] p-4">
					<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 className="text-base font-semibold text-white">
								Tus próximas sesiones
							</h2>
							<p className="mt-1 text-sm text-white/58">
								Entra directo a tus reservas semanales de Speaking.
							</p>
						</div>
					</div>
					{actionData?.error ? (
						<p className="mt-4 rounded-2xl border border-[#E87722]/30 bg-[#E87722]/12 px-4 py-3 text-sm text-[#ffd8b4]">
							{actionData.error}
						</p>
					) : null}
					{reservedSessions.error ? (
						<p className="mt-4 rounded-2xl border border-white/14 bg-white/[0.06] px-4 py-3 text-sm text-white/68">
							{reservedSessions.error}
						</p>
					) : reservedSessions.sessions.length > 0 ? (
						<div className="mt-4 grid gap-3">
							{reservedSessions.sessions.map((reserved) => {
								if (!reserved) return null
								return (
									<div
										className="rounded-[18px] border border-white/12 bg-[#111421]/72 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]"
										key={reserved.id}
									>
										<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<p className="text-sm font-semibold text-white">
														{reserved.teacherName}
													</p>
													<span className="rounded-full bg-[#0e74f7]/18 px-2.5 py-1 text-xs font-semibold text-[#9fcbff]">
														{reserved.levelLabel}
													</span>
												</div>
												<p className="mt-2 text-sm capitalize text-white/78">
													{reserved.startLabel}
												</p>
												{reserved.timeLabel ? (
													<p className="mt-1 text-xs text-white/50">
														{reserved.timeLabel}
													</p>
												) : null}
												{!reserved.canJoinNow && reserved.joinAvailableLabel ? (
													<p className="mt-2 text-xs text-white/48">
														Disponible desde {reserved.joinAvailableLabel}
													</p>
												) : null}
											</div>
											<Form method="post">
												<input
													name="intent"
													type="hidden"
													value="join-speaking-session"
												/>
												<input
													name="slotId"
													type="hidden"
													value={reserved.id}
												/>
												<Button
													className="w-full whitespace-nowrap text-sm sm:w-auto"
													disabled={!reserved.canJoinNow}
													type="submit"
												>
													Entrar
												</Button>
											</Form>
										</div>
									</div>
								)
							})}
						</div>
					) : (
						<p className="mt-4 rounded-2xl border border-white/14 bg-white/[0.06] px-4 py-3 text-sm text-white/62">
							No tienes sesiones de Speaking reservadas por ahora.
						</p>
					)}
				</div>
				<div className="mt-7">
					<ButtonLink
						to="/new"
						className="w-full text-center text-sm"
						onClick={(e) => {
							// We shouldn't need a whole server visit to start a new room,
							// so let's just do a redirect here
							e.preventDefault()
							navigate(`/${nanoid(8)}`)
							// if someone clicks the link to create a new room
							// before the js has loaded then we'll use a server side redirect
							// (in new.tsx) to send the user to a new room
						}}
					>
						Nueva sala
					</ButtonLink>
				</div>
				<details className="mt-5 cursor-pointer">
					<summary className="text-sm font-medium text-white/70">
						Unirme a una sala existente
					</summary>
					<Form
						className="grid items-end gap-4 grid-cols-[1fr_auto] w-full pt-4"
						method="post"
					>
						<div className="space-y-2">
							<Label htmlFor="room">Nombre de la sala</Label>
							<Input name="room" id="room" required />
						</div>
						<Button className="text-xs" type="submit" displayType="secondary">
							Entrar
						</Button>
					</Form>
				</details>
				<p className="mt-7 text-xs leading-5 text-white/46">
					Salas privadas de video para clases, prácticas y soporte en vivo de
					InglésConLiza.
				</p>
			</div>
		</div>
	)
}
