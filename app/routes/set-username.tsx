import { type ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { BrandLockup } from '~/components/BrandLockup'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { ACCESS_AUTHENTICATED_USER_EMAIL_HEADER } from '~/utils/constants'
import { setUsername } from '~/utils/getUsername.server'
import { safeRedirect } from '~/utils/safeReturnUrl'

export const action = async ({ request }: ActionFunctionArgs) => {
	const url = new URL(request.url)
	const returnUrl = url.searchParams.get('return-url') ?? '/'
	const accessUsername = request.headers.get(
		ACCESS_AUTHENTICATED_USER_EMAIL_HEADER
	)
	if (accessUsername) throw safeRedirect(returnUrl)
	const { username } = Object.fromEntries(await request.formData())
	invariant(typeof username === 'string')
	return setUsername(username, request, returnUrl)
}

export default function SetUsername() {
	return (
		<div className="grid h-full place-items-center px-4 py-8">
			<div className="w-full max-w-md rounded-[24px] p-5 text-white icl-panel sm:p-6">
				<BrandLockup />
				<Form
					className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
					method="post"
				>
					<div className="grid gap-3">
						<label
							className="text-sm font-medium text-white/76"
							htmlFor="username"
						>
							Escribe tu nombre visible
						</label>
						<Input
							autoComplete="off"
							autoFocus
							required
							type="text"
							id="username"
							name="username"
						/>
					</div>
					<Button className="text-xs" type="submit">
						Continuar
					</Button>
				</Form>
			</div>
		</div>
	)
}
