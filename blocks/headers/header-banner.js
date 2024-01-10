import createImgsArray from '../../fields/imgs-array'
import createImgBlock from '../img-block'
import createDrawerBlock from '../drawer'
import getRandomDocID from '../../hooks/getRandomDocID'

const headerBanner = {
	slug: 'header-banner',
	labels: {
		singular: 'Header Banner',
		plural: 'Header Banners'
	},
	fields: [
		// --- logo
		{
			type: 'upload',
			name: 'logo',
			relationTo: 'images',
			admin: {
				description: {
					de: 'Ein kleines Bild auf dem Header.',
				},
				condition: (_, siblingData) => siblingData?.useLogo,
			}
		},
		// --- background
		{
			type: 'group',
			name: 'background',
			label: ' ',
			fields: [
				// background.images
				{
					type: 'array',
					name: 'images',
					label: {
						de: 'Hintergrund',
						en: 'Background'
					},
					labels: {
						singular: {
							en: 'Image',
							de: 'Bild'
						},
						plural: {
							en: 'Images',
							de: 'Bilder'
						}
					},
					admin: {
						description: {
							de: 'Ein Header Bild sollte dem Format 1920x400 px entsprechen. Wenn mehrere Bilder eingefügt werden, wechseln diese auf der Website durch.',
							en: 'A header image should match 1920x400 px.'
						},
						initCollapsed: true,
					},
					/* defaultValue: async ({ user }) => {
						if (user) {
							const res = await fetch('/api/images')
							if (res.ok) {
								const data = await res.json()
								if (data?.docs[0]?.id) {
									return [data.docs[0], data.docs[1]]
								} else {
									return null
								}
							}
						}
					}, */
					minRows: 1,
					fields: [
						// background.images[0].rel
						{
							type: 'upload',
							name: 'rel',
							relationTo: 'images',
							label: {
								en: 'Image',
								de: 'Bild'
							},
							required: true,
							//defaultValue: async ({ user }) => await getRandomDocID('images', user.shortName)
						},
					],
				}
			]
		},
		// --- overlay
		{
			type: 'group',
			name: 'overlay',
			label: ' ',
			fields: [
				{
					type: 'blocks',
					name: 'blocks',
					label: {
						de: 'Vordergrund',
						en: 'Foreground'
					},
					blocks: [
						createImgBlock(),
						createDrawerBlock()
					],
				},
			]
		}
	]
}

export default headerBanner