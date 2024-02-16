export const widthField = {
	type: 'row',
	fields: [
		// --- block.width
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
			]
		},
	]
}