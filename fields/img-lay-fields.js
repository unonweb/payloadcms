const imgLayOptions = [
	// --- height
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
			}
		},
		defaultValue: 'medium',
		options: [
			'small', // 120px
			'medium', // 240px
			'large', // 480px
			'full' // max-content
		]
	},
]

export default imgLayOptions