import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import { Form, useLoaderData, useNavigate } from '@remix-run/react'
import { nanoid } from 'nanoid'
import invariant from 'tiny-invariant'
import { BrandLockup } from '~/components/BrandLockup'
import { Button, ButtonLink } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { useUserMetadata } from '~/hooks/useUserMetadata'
import getUsername from '~/utils/getUsername.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const directoryUrl = context.env.USER_DIRECTORY_URL
	const username = await getUsername(request, context.env)
	invariant(username)
	return json({ username, directoryUrl })
}

export const action: ActionFunction = async ({ request }) => {
	const room = (await request.formData()).get('room')
	invariant(typeof room === 'string')
	return redirect(room.replace(/ /g, '-'))
}

export default function Index() {
	const { username } = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const { data } = useUserMetadata(username)

	return (
		<div className="grid h-full place-items-center px-4 py-8">
			<div className="w-full max-w-md rounded-[24px] p-5 text-white icl-panel sm:p-6">
				<div>
					<BrandLockup />
					<div className="flex items-center justify-between gap-3">
						<p className="mt-5 text-sm text-white/64">
							Sesión iniciada como {data?.displayName}
						</p>
					</div>
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
