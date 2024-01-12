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
				condition: (data) => (data.editingMode === 'experimental') ? true : false
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
			singular: 'Internal Link',
			plural: 'Internal Links',
		},
		fields: [
			{
				type: 'group',
				name: 'link',
				label: ' ',
				fields: [
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
							condition: (data) => (data.editingMode === 'functional') ? true : false
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
							{
								type: 'text',
								name: 'title',
								localized: true,
								required: true,
								admin: {
									condition: (_, siblingData) => !siblingData.autoTitle, // show only if autoTitle is not set
									width: '50%',
								},
								hooks: {
									/* beforeValidate: [
										async (args) => {
											const user = args?.req?.user?.shortName ?? 'internal'
											const locale = args?.req?.locale

											if (args.siblingData.autoTitle) {
												const linkedDocID = args.siblingData.rel.value
												const linkedDoc = await getDoc('pages', linkedDocID, user, { depth: 0, locale: locale })
												return linkedDoc.title
											}
										}
									], */
									/* afterRead: [
										(args) => {
											if (args.siblingData.autoTitle) {
												return null
											}
										}
									] */
								}
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