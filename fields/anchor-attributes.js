export default function createAnchorAttrsFields({ label = 'Link Attributes', hideGutter = true } = {}) {
	/*
		State:
			Not used currently
	*/
	const fields = {
		type: 'group',
		name: 'linkAttrs',
		label: label,
		admin: {
			hideGutter: hideGutter,
		},
		fields: [
			// --- hover
			{
				type: 'select',
				name: 'hover',
				label: {
					de: 'Hover-Effekt',
					en: 'Hover-Effect'
				},
				hasMany: false,
				admin: {
					width: '25%'
				},
				defaultValue: ['icon'],
				options: [
					{
						value: 'icon',
						label: 'Icon'
					},
					{
						value: 'slide1',
						label: 'Slide 1'
					},
					{
						value: 'circle',
						label: 'Circle'
					},
					{
						value: 'underline1',
						label: 'Underline 1'
					},
					{
						value: 'overline1',
						label: 'overline 1'
					},
					{
						value: 'overline2',
						label: 'overline 2'
					},
				]
			},
		]
	}

	return fields
}