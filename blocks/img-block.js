import imgStyleOptions from '../fields/img-style-fields'
import imgLayOptions from '../fields/img-lay-fields'

export default function createImgBlock({ } = {}) {

	const block = {
		slug: 'img',
		labels: {
			singular: {
				en: 'Image',
				de: 'Bild'
			},
			plural: {
				en: 'Images',
				de: 'Bilder'
			}
		},
		fields: [
			// --- relationship
			{
				type: 'upload',
				name: 'rel',
				label: {
					de: ' ',
					en: ' '
				},
				relationTo: 'images',
				maxDepth: 1, // return entire image 
				required: true,
				/* defaultValue: async ({ user }) => {
					if (user) {
						const res = await fetch('/api/images')
						if (res.ok) {
							const data = await res.json()
							if (data?.docs[0]?.id) {
								return data.docs[0].id
							} else {
								return null
							}
						}
					}
				} */
			},
			// [style options]
			{
				type: 'collapsible',
				label: {
					de: 'Style Optionen',
					en: 'Style Options'
				},
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'style') ? true : false,
				},
				fields: [
					{
						type: 'row',
						admin: {
							condition: (data) => (data.editingMode === 'style') ? true : false,
						},
						fields: [
							...imgStyleOptions
						]
					},
				]
			},
			// [layout options]
			{
				type: 'collapsible',
				label: {
					de: 'Layout Optionen',
					en: 'Layout Options'
				},
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'layout') ? true : false,
				},
				fields: [
					{
						type: 'row',
						admin: {
							condition: (data) => (data.editingMode === 'layout') ? true : false,
						},
						fields: [
							...imgLayOptions
						]
					},
				]
			},
			// [functional options]
			{
				type: 'collapsible',
				label: {
					de: 'Funktionale Optionen',
					en: 'Functional Options'
				},
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'functional') ? true : false,
				},
				fields: [
					{
						type: 'row',
						fields: [
							// --- group: link
							{
								type: 'group',
								name: 'link',
								label: ' ',
								fields: [
									{
										type: 'collapsible',
										label: 'Link',
										admin: {
											initCollapsed: true
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
											// --- row: link.slug || link.url
											{
												type: 'row',
												fields: [
													// --- link.slug (link.type == 'internal')
													{
														type: 'relationship',
														name: 'rel',
														label: {
															de: 'Verlinktes Dokument',
															en: 'Linked Document'
														},
														relationTo: ['pages', 'posts'],
														required: true,
														maxDepth: 2,
														admin: {
															width: '50%',
															condition: (_, siblingData) => siblingData?.type === 'internal',
														},
														/* hooks: {
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
														} */
													},
													// --- link.url (link.type == 'custom')
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
						]
					}
				],
			}
		]
	}

	return block
}