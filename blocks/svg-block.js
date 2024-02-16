import showOptionsField from '../fields/showOptions'

export default function createSVGBlock() {
	const block = {
		slug: 'svg',
		labels: {
			singular: 'Vektorgrafik (.svg)',
			plural: 'Vektorgrafiken (.svg)'
		},
		fields: [
			showOptionsField,
			{
				type: 'code',
				name: 'svg',
				localized: false,
				admin: {
					language: 'html',
				},
				validate: (val, { data, operation }) => (val && val.startsWith('<svg') && val.endsWith('</svg>')) ? true : 'SVG code not valid'
			},
			{
				type: 'array',
				name: 'attributes',
				admin: {
					condition: (data, siblingData) => siblingData.showOptions,
				},
				fields: [
					{
						type: 'row',
						fields: [
							{
								type: 'text',
								name: 'key',
								label: 'Key',
							},
							{
								type: 'text',
								name: 'value',
								label: 'Value',
							},
						]
					}
				]
			}
		]
	}

	return block
}