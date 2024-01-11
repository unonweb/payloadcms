const imgStyleOptions = [
	// --- shape
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
				value: 'oval',
				label: {
					de: 'Oval',
					en: 'Oval'
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
	},
	// --- filter
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
	// --- hover
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
		defaultValue: [ 'outline' ],
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
		]
	},
	// --- mask
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

export default imgStyleOptions