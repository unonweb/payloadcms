export const imgOptions = [
	// --- img.caption
	{
		name: 'caption',
		type: 'text',
	},
	// --- img.minwidth | img.maxwidth | img.width | img.height
	{
		type: 'row',
		fields: [
			// --- img.minwidth
			{
				type: 'number',
				name: 'minwidth',
				label: {
					de: 'Min-Breite',
					en: 'Min-Width'
				},
				admin: {
					width: '25%',
					placeholder: {
						de: 'in Pixel',
						en: 'in pixels',
					}
				},
				min: 1,
			},
			// --- img.maxwidth
			{
				type: 'number',
				name: 'maxwidth',
				label: {
					de: 'Max-Breite',
					en: 'Max-Width'
				},
				admin: {
					width: '25%',
					placeholder: {
						de: 'in Pixel',
						en: 'in pixels',
					}
				},
			},
			// --- img.width
			{
				type: 'number',
				name: 'width',
				label: {
					de: 'Breite',
					en: 'Width'
				},
				admin: {
					width: '25%',
					hidden: false,
					placeholder: {
						de: '... in %',
						en: '... in %',
					}
				},
				min: 15,
				max: 100,
				defaultValue: 100,
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
					condition: (data, siblingData) => siblingData.shape !== 'circle',
					hidden: false,
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
			// --- img.alignSelf
			{
				type: 'select',
				name: 'alignSelf',
				label: {
					de: 'Ausrichtung',
					en: 'Alignment'
				},
				admin: {
					width: '25%',
					hidden: false,
				},
				options: [
					{
						label: {
							de: 'Start',
							en: 'Start',
						},
						value: 'start',
					},
					{
						label: {
							de: 'Center',
							en: 'Center'
						},
						value: 'center',
					},
					{
						label: {
							de: 'Ende',
							en: 'End'
						},
						value: 'end',
					},
					{
						label: 'Baseline',
						value: 'baseline',
					},
				],
			},
			// --- img.alignX
			// --- hidden
			{
				type: 'select',
				name: 'alignX',
				label: {
					de: 'Horizontale Ausrichtung',
					en: 'Horizontal Alignment'
				},
				admin: {
					width: '25%',
					condition: (data, siblingData) => siblingData.width !== '100',
					hidden: true,
				},
				options: [
					{
						label: {
							de: 'Links',
							en: 'Left'
						},
						value: 'left',
					},
					{
						label: {
							de: 'Zentriert',
							en: 'Center'
						},
						value: 'center-x',
					},
					{
						label: {
							de: 'Rechts',
							en: 'Right'
						},
						value: 'right',
					},
				]
			},
			// --- img.alignY
			// --- hidden
			{
				type: 'select',
				name: 'alignY',
				label: {
					de: 'Vertikale Ausrichtung',
					en: 'Vertical Alignment'
				},
				admin: {
					width: '25%',
					hidden: true,
				},
				options: [
					{
						label: {
							de: 'Oben',
							en: 'Top'
						},
						value: 'top',
					},
					{
						label: {
							de: 'Zentriert',
							en: 'Center'
						},
						value: 'center-y',
					},
					{
						label: {
							de: 'Unten',
							en: 'Bottom'
						},
						value: 'bottom',
					},
				]
			},
		]
	},
	// --- img.link
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
	},
	// --- img.shape | img.filter | img.hover | img.mask
	{
		type: 'row',
		fields: [
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
			// --- img.filter
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
			},
			// --- img.hover
			{
				type: 'select',
				name: 'hover',
				label: {
					de: 'Hover-Effekt',
					en: 'Hover-Effect'
				},
				hasMany: true,
				admin: {
					width: '25%'
				},
				//defaultValue: ['outline'],
				options: [
					{
						value: 'scale',
						label: {
							de: 'Vergrößern',
							en: 'Scale'
						}
					},
					{
						value: 'lighten',
						label: {
							de: 'Auffhellen',
							en: 'Lighten'
						}
					},
					{
						value: 'outline',
						label: {
							de: 'Outline',
							en: 'Outline'
						}
					},
					{
						value: 'shadow',
						label: {
							de: 'Schatten',
							en: 'Shadow'
						}
					},
					{
						value: 'magnify',
						label: {
							de: 'Lupe',
							en: 'Magnify'
						}
					},
				]
			},
			// --- img.mask
			{
				type: 'select',
				name: 'mask',
				label: {
					de: 'Maske',
					en: 'Mask'
				},
				admin: {
					width: '25%'
				},
				options: [
					{
						value: 'spotlight',
						label: {
							de: 'Spotlight',
							en: 'Spotlight'
						}
					},
				]
			},
		]
	},
]

let width = {
	type: 'select',
	name: 'width',
	label: {
		de: 'Breite',
		en: 'Width'
	},
	admin: {
		width: '25%',
		hidden: false,
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
}