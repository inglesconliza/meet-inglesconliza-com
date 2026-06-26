import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import type { ChatCard } from '~/types/GoogleChatApi'
import { RELEASE } from '~/utils/constants'
import { dashboardLogsLink } from '~/utils/dashboardLogsLink'

export type DeadTrackInfo = {
	pullSessionTrace: string
	pushedSessionTrace: string
	trackId: string
	pullingUser?: string
	pushingUser?: string
	meetingId?: string
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
	if (!context.env.FEEDBACK_URL || !context.env.FEEDBACK_QUEUE) {
		throw new Response('not found', { status: 404 })
	}
	const info: DeadTrackInfo = await request.json()
	const {
		pullSessionTrace,
		pushedSessionTrace,
		trackId,
		pullingUser,
		pushingUser,
		meetingId,
	} = info

	const { hostname } = new URL(request.url)

	let dashboardLink = ''

	if (meetingId && context.env.DASHBOARD_WORKER_URL) {
		dashboardLink = dashboardLogsLink(context.env.DASHBOARD_WORKER_URL, [
			{
				id: '2',
				key: 'meetingId',
				type: 'string',
				value: meetingId,
				operation: 'eq',
			},
		])
		const dashboardLogsParams = new URLSearchParams({
			view: 'events',
			needle: JSON.stringify({ value: '', matchCase: false, isRegex: false }),
			filters: JSON.stringify([
				{
					id: '2',
					key: 'meetingId',
					type: 'string',
					value: meetingId,
					operation: 'eq',
				},
			]),
		})

		dashboardLink =
			context.env.DASHBOARD_WORKER_URL +
			`/observability/logs?${dashboardLogsParams}`
	}

	const chatCard: ChatCard = {
		cardsV2: [
			{
				cardId: 'orange-meets-dead-track-card',
				card: {
					header: {
						title: `💀 Pista caída: ${pullingUser} tuvo problemas recibiendo de ${pushingUser}`,
						subtitle: `Hora: ${new Date().toISOString()} Entorno: ${hostname} commit: ${RELEASE}`,
						imageUrl:
							'https://developers.google.com/chat/images/quickstart-app-avatar.png',
						imageType: 'CIRCLE',
					},
					sections: [
						{
							header: 'ID de pista',
							widgets: [
								{
									textParagraph: {
										text: trackId,
									},
								},
							],
							collapsible: false,
						},
						{
							header: 'Enlaces de trazas',
							widgets: [
								{
									buttonList: {
										buttons: [
											{
												text: `Traza de recepción de ${pullingUser}`,
												onClick: {
													openLink: {
														url: pullSessionTrace,
													},
												},
											},
											{
												text: `Traza de envío de ${pushingUser}`,
												onClick: {
													openLink: {
														url: pushedSessionTrace,
													},
												},
											},
										],
									},
								},
							],
							collapsible: false,
						},
						...(dashboardLink
							? [
									{
										header: 'Enlace al panel',
										widgets: [
											{
												buttonList: {
													buttons: [
														{
															text: 'Registros del panel',
															onClick: {
																openLink: {
																	url: dashboardLink,
																},
															},
														},
													],
												},
											},
										],
										collapsible: false,
									},
								]
							: []),
					],
				},
			},
		],
	}

	await context.env.FEEDBACK_QUEUE.send(chatCard)

	return json({
		status: 'ok',
	})
}
