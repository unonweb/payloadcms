import createRichTextBlock from './rich-text-block.js'

export default function createDrawerBlock() {
	const block = {
		slug: 'drawer',
		labels: {
			singular: {
				de: 'Drawer',
				en: 'Drawer'
			},
			plural: {
				de: 'Drawers',
				en: 'Drawers'
			}
		},
		fields: [
			{
				type: 'group',
				name: 'trigger',
				label: ' ',
				fields: [
					// --- trigger
					{
						type: 'select',
						name: 'type',
						label: 'Trigger Type',
						options: ['hamburger', 'image']
					},
					// --- image
					{
						type: 'upload',
						name: 'img',
						label: {
							en: 'Image',
							de: 'Bild'
						},
						relationTo: 'images',
						admin: {
							condition: (_, siblingData) => siblingData.type === 'image'
						},
					}
				]
			},
			{
				type: 'group',
				name: 'content',
				label: ' ',
				fields: [
					{
						type: 'blocks',
						name: 'blocks',
						label: {
							en: 'Content',
							de: 'Inhalt'
						},
						labels: {
							singular: {
								en: 'Content',
								de: 'Inhalt'
							},
							plural: {
								en: 'Contents',
								de: 'Inhalte'
							}
						},
						// --- upload array start
						defaultValue: [
							{
								blockType: 'rich-text'
							}
						],
						blocks: [
							createRichTextBlock(),
						]

					}
				]
			}

		]
	}

	return block
}
