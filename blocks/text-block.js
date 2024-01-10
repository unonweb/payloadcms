import textStyleFields from '../fields/text-style-fields'

export default function createTextBlock({ slot = '', nolabel = true } = {}) {
	
	const slotField = (slot) 
		? {
			type: 'text',
			name: 'slot',
			defaultValue: slot,
			hidden: true,
		}
		: {
			type: 'text',
			name: 'slot',
			hidden: true,
		}

	const label = (nolabel) ? ' ' : 'Text'

	const block = {
		slug: 'text',
		labels: {
			singular: {
				de: 'Ein einfacher Textblock',
				en: 'A simple text block'
			},
			plural: {
				de: 'Text Blocks',
				en: 'Text Blocks'
			}
		},
		fields: [
			// --- text
			{
				type: 'text',
				name: 'text',
				label: label,
			},
			// --- options
			{
				type: 'collapsible',
				label: {
					en: 'Options',
					de: 'Optionen'
				},
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'style') ? true : false
				},
				fields: [
					{
						type: 'row',
						fields: [
							...textStyleFields
						]
					},
					// --- slot
					slotField,
				]
			}
		],
	}

	return block
}