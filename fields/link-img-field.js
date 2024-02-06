import getDocFieldValue from '../hooks/getDocFieldValue'
import reportError from '../helpers/reportError'

export default function createLinkImgField({relationTo = ['pages', 'posts-flex']} = {}) {
	/* not used currently */
	if (!Array.isArray(relationTo)) {
		relationTo = [relationTo]
	}

	const field = 
	{
		type: 'group',
		name: 'link',
		label: ' ',
		fields: [
			// --- collapsible: link
			{
				type: 'collapsible',
				label: 'Link',
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'functional') ? true : false,
				},
				fields: [
					// --- link.type
					{
						type: 'radio',
						name: 'type',
						label: {
							de: 'Typ',
							en: 'Type'
						},
						options: [
							{
								label: {
									de: 'Kein Link',
									en: 'No Link'
								},
								value: 'none',
							},
							{
								label: {
									de: 'Interner Link',
									en: 'Internal Link'
								},
								value: 'internal',
							},
							{
								label: {
									en: 'Custom URL',
									de: 'URL Eingabe'
								},
								value: 'custom',
							},
						],
						defaultValue: 'none',
						admin: {
							layout: 'horizontal',
						},
					},
					// --- link.slug || link.url
					{
						type: 'row',
						fields: [
							// --- link.slug
							// (linkType == 'internal')
							{
								type: 'relationship',
								name: 'slug',
								label: 'Document to link to',
								relationTo: [
									...relationTo
								],
								required: true,
								maxDepth: 2,
								admin: {
									width: '50%',
									condition: (_, siblingData) => siblingData?.type === 'internal',
								},
								hooks: {
									afterRead: [
										async (args) => {
											try {
												if (args.siblingData.type === 'none' || args.req.user) {
													return
												}
												else if (args.req.payloadAPI === 'REST' && args.value) {
													//console.log(args)
													const docTitle = args.originalDoc.title ?? 'no title'
													const refCollection = args.value.relationTo
													const refID = args.value.value
													console.log(`[link-field] \n\ton page "${docTitle}" \n\textracting "slug" from doc "${refID}" in col "${refCollection}"`)
													let slug = await getDocFieldValue(refCollection, refID, 'slug')
													if (slug === undefined) {
														throw Error('[link-field] returned slug is undefined')
													}
													return slug
												} 
												else {
													return
												}
											} catch (err) {
												reportError(err, args.req)
											}
										}
									]
								}
							},
							// --- link.url
							// (linkType == 'custom')
							{
								type: 'text',
								name: 'url',
								label: 'Custom URL',
								required: true,
								admin: {
									condition: (_, siblingData) => siblingData?.type === 'custom',
								},
							},
						],
					}
				]
			}
		]
	}
	
	return field
}