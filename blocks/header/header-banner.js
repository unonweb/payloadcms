import createUnImgBlock from '../img/un-img'
import createDrawerBlock from '../drawer'
import createRichTextBlock from '../rich-text-block'
import createImgBlock from '../img/img'

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
			admin: {
				hideGutter: true,
				className: 'hide-group-label'
			},
			fields: [
				{
					type: 'blocks',
					name: 'blocks',
					label: {
						de: 'Hintergrund',
						en: 'Background'
					},
					blocks: [
						createImgBlock(),
						createRichTextBlock(),
					],
				},
			]
		},
		// --- overlay
		{
			type: 'group',
			name: 'overlay',
			label: ' ',
			admin: {
				hideGutter: true,
				className: 'hide-group-label'
			},
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