const textStyleFields = [
	// --- heading
	{
		type: 'select',
		name: 'heading',
		label: {
			de: 'Überschrift',
			en: 'Heading'
		},
		admin: {
			width: '25%'
		},
		options: [ 'h3', 'h4', 'h5', 'h6' ]
	},
	// --- formatting
	{
		type: 'select',
		name: 'formatting',
		label: {
			de: 'Formatierung',
			en: 'Formatting'
		},
		admin: {
			width: '25%'
		},
		hasMany: true,
		options: [
			{
				value: 'bold',
				label: {
					de: 'Fett',
					en: 'Bold'
				}
			},
			{
				value: 'italic',
				label: {
					de: 'Kursiv',
					en: 'Italic'
				}
			},
			{
				value: 'underline',
				label: {
					de: 'Unterstrichen',
					en: 'Underlined'
				}
			},
		]
	},
]

export default textStyleFields