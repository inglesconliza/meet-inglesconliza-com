import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useNavigate, useParams, useSearchParams } from '@remix-run/react'
import { useObservableAsValue } from 'partytracks/react'
import invariant from 'tiny-invariant'
import { AudioIndicator } from '~/components/AudioIndicator'
import { BrandLockup } from '~/components/BrandLockup'
import { Button } from '~/components/Button'
import { CameraButton } from '~/components/CameraButton'
import { CopyButton } from '~/components/CopyButton'
import { Disclaimer } from '~/components/Disclaimer'
import { Icon } from '~/components/Icon/Icon'
import { MicButton } from '~/components/MicButton'

import { SelfView } from '~/components/SelfView'
import { SettingsButton } from '~/components/SettingsDialog'
import { Spinner } from '~/components/Spinner'
import { Tooltip } from '~/components/Tooltip'
import { useRoomContext } from '~/hooks/useRoomContext'
import { useRoomUrl } from '~/hooks/useRoomUrl'
import getUsername from '~/utils/getUsername.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const username = await getUsername(request)
	invariant(username)
	return json({ username, callsAppId: context.env.CALLS_APP_ID })
}

let refreshCheckDone = false
function trackRefreshes() {
	if (refreshCheckDone) return
	if (typeof document === 'undefined') return

	const key = `previously loaded`
	const initialValue = sessionStorage.getItem(key)
	const refreshed = initialValue !== null
	sessionStorage.setItem(key, Date.now().toString())

	if (refreshed) {
		fetch(`/api/reportRefresh`, {
			method: 'POST',
		})
	}

	refreshCheckDone = true
}

export default function Lobby() {
	const { roomName } = useParams()
	const navigate = useNavigate()
	const { setJoined, userMedia, room, partyTracks } = useRoomContext()
	const { videoStreamTrack, audioStreamTrack, audioEnabled } = userMedia
	const session = useObservableAsValue(partyTracks.session$)
	const sessionError = useObservableAsValue(partyTracks.sessionError$)
	trackRefreshes()

	const joinedUsers = new Set(
		room.otherUsers.filter((u) => u.tracks.audio).map((u) => u.name)
	).size

	const roomUrl = useRoomUrl()

	const [params] = useSearchParams()

	return (
		<div className="grid h-full place-items-center px-4 py-8">
			<div className="w-full max-w-lg space-y-5 rounded-[24px] p-5 text-white icl-panel sm:p-6">
				<BrandLockup compact />
				<div>
					<h1 className="text-2xl font-bold text-white">{roomName}</h1>
					<p className="text-sm text-white/62">
						{`${joinedUsers} ${
							joinedUsers === 1 ? 'user' : 'users'
						} in the room.`}{' '}
					</p>
				</div>
				<div className="relative">
					<SelfView
						className="aspect-[4/3] w-full rounded-[20px]"
						videoTrack={videoStreamTrack}
					/>

					<div className="absolute left-3 top-3">
						{!sessionError && !session?.sessionId ? (
							<Spinner className="text-zinc-100" />
						) : (
							audioStreamTrack && (
								<>
									{audioEnabled ? (
										<AudioIndicator audioTrack={audioStreamTrack} />
									) : (
										<Tooltip content="Mic is turned off">
											<div className="text-white indication-shadow">
												<Icon type="micOff" />
												<VisuallyHidden>Mic is turned off</VisuallyHidden>
											</div>
										</Tooltip>
									)}
								</>
							)
						)}
					</div>
				</div>
				{sessionError && (
					<div className="rounded-2xl border border-red-200/30 bg-red-500/24 p-3 text-sm text-white">
						{sessionError}
					</div>
				)}
				{(userMedia.audioUnavailableReason ||
					userMedia.videoUnavailableReason) && (
					<div className="rounded-2xl border border-white/16 bg-white/12 p-3 text-sm text-white/82">
						{userMedia.audioUnavailableReason === 'NotAllowedError' &&
							userMedia.videoUnavailableReason === undefined && (
								<p>Mic permission was denied.</p>
							)}
						{userMedia.videoUnavailableReason === 'NotAllowedError' &&
							userMedia.audioUnavailableReason === undefined && (
								<p>Camera permission was denied.</p>
							)}
						{userMedia.audioUnavailableReason === 'NotAllowedError' &&
							userMedia.videoUnavailableReason === 'NotAllowedError' && (
								<p>Mic and camera permissions were denied.</p>
							)}
						{userMedia.audioUnavailableReason === 'NotAllowedError' && (
							<p>
								Enable permission
								{userMedia.audioUnavailableReason &&
								userMedia.videoUnavailableReason
									? 's'
									: ''}{' '}
								and reload the page to join.
							</p>
						)}
						{userMedia.audioUnavailableReason === 'DevicesExhaustedError' && (
							<p>No working microphone found.</p>
						)}
						{userMedia.videoUnavailableReason === 'DevicesExhaustedError' && (
							<p>No working webcam found.</p>
						)}
						{userMedia.audioUnavailableReason === 'UnknownError' && (
							<p>Unknown microphone error.</p>
						)}
						{userMedia.videoUnavailableReason === 'UnknownError' && (
							<p>Unknown webcam error.</p>
						)}
					</div>
				)}
				<div className="flex flex-wrap gap-3 text-sm">
					<Button
						onClick={() => {
							setJoined(true)
							// we navigate here with javascript instead of an a
							// tag because we don't want it to be possible to join
							// the room without the JS having loaded
							navigate(
								'room' + (params.size > 0 ? '?' + params.toString() : '')
							)
						}}
						disabled={!session?.sessionId}
					>
						Join
					</Button>
					<MicButton />
					<CameraButton />
					<SettingsButton />
					<Tooltip content="Copy URL">
						<CopyButton contentValue={roomUrl}></CopyButton>
					</Tooltip>
				</div>
				<Disclaimer className="pt-1 text-white/38" />
			</div>
		</div>
	)
}
