import showOptionsField from '../../fields/showOptions.js'

export default function createImgBlock(options = []) {

	//options ??= ['caption', 'link']

	const block = {
		slug: 'img',
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
		fields: [
			// --- img.rel
			{
				type: 'upload',
				name: 'rel',
				label: {
					de: ' ',
					en: ' '
				},
				relationTo: 'images',
				maxDepth: 1, // return entire image 
				required: true,
			},
			// --- img.showOptions
			(options.length > 0) ? showOptionsField : '',
			(options.includes('size') || options.includes('caption')) ?
			{
				type: 'row',
				admin: {
					condition: (data, siblingData) => siblingData.showOptions,
				},
				fields: [
					// --- img.caption
					(options.includes('caption')) ?
						{
							type: 'text',
							name: 'caption',
							label: {
								de: 'Untertitel',
								en: 'Caption',
							},
						} : '',
				]
			} : '',
			// --- img.link
			(options.includes('link')) ? 
			{
				type: 'group',
				name: 'link',
				label: ' ',
				admin: {
					hideGutter: true,
					className: 'hide-group-label',
					condition: (data, siblingData) => siblingData.showOptions,
				},
				fields: [
					// --- link.type
					{
						type: 'radio',
						name: 'type',
						label: {
							de: 'Typ',
							en: 'Type'
						},
						options: [
							{
								label: {
									de: 'Kein Link',
									en: 'No Link'
								},
								value: 'none',
							},
							{
								label: {
									de: 'Interner Link',
									en: 'Internal Link'
								},
								value: 'internal',
							},
							{
								label: {
									en: 'Custom URL',
									de: 'URL Eingabe'
								},
								value: 'custom',
							},
						],
						defaultValue: 'none',
						admin: {
							layout: 'horizontal',
						},
					},
					// --- row: link.slug || link.url
					{
						type: 'row',
						fields: [
							// --- link.slug (link.type == 'internal')
							{
								type: 'relationship',
								name: 'rel',
								label: {
									de: 'Verlinktes Dokument',
									en: 'Linked Document'
								},
								relationTo: ['pages', 'posts-flex'],
								required: true,
								maxDepth: 2,
								admin: {
									width: '50%',
									condition: (data, siblingData) => siblingData?.type === 'internal',
								},
							},
							// --- link.url (link.type == 'custom')
							{
								type: 'text',
								name: 'url',
								label: 'Custom URL',
								required: true,
								admin: {
									condition: (data, siblingData) => siblingData?.type === 'custom',
								},
							},
						],
					}
				]
			} : '',
		].filter(field => field)
	}

	return block
}
