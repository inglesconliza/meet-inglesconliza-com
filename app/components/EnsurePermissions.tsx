import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'

export interface EnsurePermissionsProps {
	children?: ReactNode
	onMicSelected: (deviceId: string) => void
	onCameraSelected: (deviceId: string) => void
}

type PermissionState = 'denied' | 'granted' | 'prompt' | 'unable-to-determine'

async function getExistingPermissionState(): Promise<PermissionState> {
	try {
		const query = await navigator.permissions.query({
			name: 'microphone' as any,
		})
		return query.state
	} catch (error) {
		return 'unable-to-determine'
	}
}

export function EnsurePermissions(props: EnsurePermissionsProps) {
	const [permissionState, setPermissionState] =
		useState<PermissionState | null>(null)

	const mountedRef = useRef(true)

	useEffect(() => {
		getExistingPermissionState().then((result) => {
			if (mountedRef.current) setPermissionState(result)
		})
		return () => {
			mountedRef.current = false
		}
	}, [])

	if (permissionState === null) return null

	if (permissionState === 'denied') {
		return (
			<div className="grid h-full place-items-center px-4 py-8">
				<div className="max-w-sm space-y-2 rounded-[24px] p-5 text-white icl-panel sm:p-6">
					<h1 className="text-2xl font-bold">Permiso denegado</h1>
					<p>
						Tendrás que entrar en la configuración de tu navegador y volver a
						habilitar el permiso manualmente.
					</p>
				</div>
			</div>
		)
	}

	if (permissionState === 'prompt') {
		return (
			<div className="grid h-full place-items-center px-4 py-8">
				<div className="max-w-sm rounded-[24px] p-5 text-white icl-panel sm:p-6">
					<p className="mb-8 text-white/76">
						InglésConLiza Meet necesita acceso a tu cámara y micrófono. El
						navegador te pedirá permiso.
					</p>
					<Button
						onClick={() => {
							navigator.mediaDevices
								.getUserMedia({
									video: true,
									audio: true,
								})
								.then((ms) => {
									if (mountedRef.current) setPermissionState('granted')
									const micId = ms.getAudioTracks()[0].getSettings().deviceId
									if (micId) props.onMicSelected(micId)
									const cameraId = ms.getVideoTracks()[0].getSettings().deviceId
									if (cameraId) props.onCameraSelected(cameraId)
									ms.getTracks().forEach((t) => t.stop())
								})
								.catch(() => {
									if (mountedRef.current) setPermissionState('denied')
								})
						}}
					>
						Permitir acceso
					</Button>
				</div>
			</div>
		)
	}

	return props.children
}
