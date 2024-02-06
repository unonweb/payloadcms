import showOptionsField from '../../fields/showOptions.js'

export default function createUnImgBlock(options = []) {

	//options ??= ['caption', 'size', 'link', 'shape', 'filter']

	const block = {
		slug: 'un-img',
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
						// --- img.size
						(options.includes('size')) ?
							{
								type: 'select',
								name: 'size',
								label: {
									de: 'Größe',
									en: 'Size'
								},
								admin: {
									width: '25%',
									description: {
										de: 'Die Größe wird vor allem vom vorhandenen Platz bestimmt. Dieser kann in der Layout-Einstellung ganz oben verändert werden.',
										en: 'The size is limited by the available space. The latter may be changed by the Layout setting above.'
									},
									condition: (data, siblingData) => siblingData.showOptions,
								},
								defaultValue: 'medium',
								options: [
									'small', // 120px
									'medium', // 240px
									'large', // 480px
									'full' // max-content
								]
							} : '',
					]
				} : '',
			(options.includes('shape') || options.includes('filter')) ?
				{
					type: 'row',
					admin: {
						condition: (data, siblingData) => siblingData.showOptions,
					},
					fields: [
						// --- shape
						(options.includes('shape')) ?
						{
							type: 'select',
							name: 'shape',
							label: {
								de: 'Form',
								en: 'Shape'
							},
							admin: {
								width: '25%'
							},
							defaultValue: 'rounded',
							options: [
								{
									value: 'circle',
									label: {
										de: 'Kreis',
										en: 'Circle'
									}
								},
								{
									value: 'rounded',
									label: {
										de: 'Abgerundete Ecken',
										en: 'Rounded Corners'
									}
								},
								{
									value: 'polygon',
									label: {
										de: 'Polygon',
										en: 'Polygon'
									}
								},
							]
						} : '',
						// --- filter
						(options.includes('shape')) ?
						{
							type: 'select',
							name: 'filter',
							label: {
								de: 'Filter',
								en: 'Filter'
							},
							admin: {
								width: '25%'
							},
							options: [
								{
									value: 'sepia',
									label: {
										de: 'Sepia',
										en: 'Sepia'
									}
								},
								{
									value: 'grey',
									label: {
										de: 'Grau',
										en: 'Grey'
									}
								},
								{
									value: 'shadow',
									label: {
										de: 'Schatten',
										en: 'Shadow'
									}
								},
							]
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
