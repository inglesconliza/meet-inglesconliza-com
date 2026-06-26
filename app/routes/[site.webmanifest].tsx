import { json } from 'react-router'

export const loader = async () => {
	return json({
		name: 'InglésConLiza Meet',
		short_name: 'ICL Meet',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
		theme_color: '#111421',
		background_color: '#111421',
		display: 'standalone',
	})
}
