export default function createLinkExtBlock({ slots = [] } = {}) {
	if (!Array.isArray(slots)) {
		slots = [slots];
	}
	const slotField =
		slots.length > 0
			? {
				type: 'select',
				name: 'slot',
				options: [...slots],
				defaultValue: slots[0],
				admin: {
					readOnly: false,
				},
			}
			: {
				type: 'text',
				name: 'slot',
				hidden: true,
			};

	// --- block
	const block = {
		slug: 'link-external',
		labels: {
			singular: 'External Link',
			plural: 'External Links',
		},
		fields: [
			{
				type: 'group',
				name: 'link',
				label: ' ',
				fields: [
					{
						type: 'row',
						fields: [
							// --- url
							{
								type: 'text',
								name: 'url',
								label: {
									de: 'URL',
									en: 'URL'
								},
								localized: false,
								required: false,
								admin: {
									width: '60%',
									placeholder: 'https://developer.mozilla.org/en-US/',
								},
							},
							// --- title
							{
								type: 'text',
								name: 'title',
								label: {
									de: 'Titel',
									en: 'Title'
								},
								localized: true,
								required: true,
								admin: {
									width: '40%'
								},
							},
						]
					}
				],
			},
			// --- slot
			slotField,
			// icon
			/* {
				type: 'upload',
				name: 'icon',
				relationTo: 'images',
				admin: {
					description: {
						de: 'Optional. Ein kleines Bild (z.B. 128x128px) das zusätzlich zu oder anstelle eines Texts den Menüpunkt bezeichnet.',
					},
					condition: (_, siblingData) => siblingData?.useIcon,
				},
			}, */
		],
	};

	return block;
}