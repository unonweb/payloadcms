import textStyleFields from '../fields/text-style-fields'

export default function createTextAreaBlock() {

	const block = {
		slug: 'text-area',
		labels: {
			singular: {
				de: 'Textarea',
				en: 'Textarea'
			},
			plural: {
				de: 'Textareas',
				en: 'Textareas'
			}
		},
		fields: [
			// --- text
			{
				type: 'textarea',
				name: 'text',
			},
			// --- options
			{
				type: 'collapsible',
				label: {
					en: 'Options',
					de: 'Optionen'
				},
				admin: {
					initCollapsed: true
				},
				fields: [
					{
						type: 'row',
						fields: [
							...textStyleFields
						]
					},
				]
			}
		],
	}

	return block
}