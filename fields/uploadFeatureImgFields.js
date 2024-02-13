export const uploadFeatureImgFields = [
	// --- img.caption
	{
		name: 'caption',
		type: 'text',
	},
	// --- img.shape
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
				value: 'rectangle',
				label: {
					de: 'Rechteck',
					en: 'Rectangle'
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
	},
	// --- img.size
	{
		type: 'row',
		fields: [
			// --- img.width
			
			// --- img.width
			{
				type: 'select',
				name: 'width',
				label: {
					de: 'Breite',
					en: 'Width'
				},
				admin: {
					width: '25%',
				},
				defaultValue: '100',
				options: [
					{
						label: '1/4',
						value: '25',
					},
					{
						label: '1/3',
						value: '33',
					},
					{
						label: '1/2',
						value: '50',
					},
					{
						label: '2/3',
						value: '66',
					},
					{
						label: '3/4',
						value: '75',
					},
					{
						label: '100%',
						value: '100',
					},
				]
			},
			// --- img.height
			{
				type: 'select',
				name: 'height',
				label: {
					de: 'Höhe',
					en: 'Height'
				},
				admin: {
					width: '25%',
					condition: (data, siblingData) => siblingData.shape !== 'circle'
				},
				defaultValue: 'full',
				options: [
					{
						label: '120px',
						value: '120px',
					},
					{
						label: '240px',
						value: '240px',
					},
					{
						label: '360px',
						value: '360px',
					},
					{
						label: '480px',
						value: '480px',
					},
					{
						label: '600px',
						value: '600px',
					},
					{
						label: 'full',
						value: 'auto',
					},
				]
			},
		]
	},
	// img.link
	{
		type: 'group',
		name: 'link',
		label: 'Link',
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
			{
				type: 'row',
				fields: [
					// --- link.slug
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
					// --- link.url
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
	}
]