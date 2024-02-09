import showOptionsField from '../fields/showOptions';

export default function createLinkIntBlock({ slots = [] } = {}) {

	// --- slots
	slots = (!Array.isArray(slots)) ? [slots] : slots

	const slotField = (slots.length > 0)
		? {
			type: 'select',
			name: 'slot',
			options: [...slots],
			//defaultValue: slots[0],
			admin: {
				readOnly: false,
			},
		}
		: {
			type: 'text',
			name: 'slot',
			hidden: true,
		};

	// --- link-internal
	const block = {
		slug: 'link-internal',
		labels: {
			singular: {
				de: 'Interner Link',
				en: 'Internal Link'
			},
			plural: {
				de: 'Interne Links',
				en: 'Internal Links'
			},
		},
		fields: [
			{
				type: 'group',
				name: 'link',
				label: ' ',
				admin: {
					hideGutter: true,
					className: 'hide-group-label'
				},
				fields: [
					// --- showOptions
					/* showOptionsField,
					{
						type: 'row',
						admin: {
							condition: (data, siblingData) => siblingData.showOptions,
						},
						fields: [
							
						]
					}, */
					// --- autoTitle
					{
						type: 'checkbox',
						name: 'autoTitle',
						label: {
							de: 'Link-Titel entspricht Dokument-Titel',
							en: 'Link title corresponds to document title'
						},
						defaultValue: true,
						admin: {
							width: '25%',
						},
					},
					{
						type: 'row',
						fields: [
							// --- rel
							{
								type: 'relationship',
								name: 'rel',
								label: {
									en: 'Destination',
									de: 'Ziel'
								},
								relationTo: ['pages'],
								required: true,
								maxDepth: 0,
								admin: {
									width: '50%',
								},
							},
							// --- title
							{
								type: 'text',
								name: 'title',
								localized: true,
								required: true,
								admin: {
									condition: (_, siblingData) => !siblingData.autoTitle, // show only if autoTitle is not set
									width: '25%',
								},
							},
						]
					},
				],
			},
			// optionally add icon
			/* {
				type: 'checkbox',
				name: 'useIcon',
				defaultValue: false,
				label: {
					de: 'Icon hinzufügen',
					en: 'Add icon'
				},
				admin: {
					readOnly: true
				}
			}, */

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