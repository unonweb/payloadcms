import getCol from '../hooks/_getCol'
import updateDocSingle from '../hooks/updateDocSingle'

export default function createIncludePostsBlock() {
	const block = {
		slug: 'include-posts',
		labels: {
			singular: {
				en: 'Posts',
				de: 'Posts'
			},
		},
		fields: [
			// --- categories
			{
				type: 'relationship',
				relationTo: 'tags',
				name: 'tags',
				label: {
					de: 'Welche Posts sollen einbezogen werden (Auswahl durch Schlagworte)',
					en: 'Which posts should be included (selection by tags)'
				},
				filterOptions: () => {
					return {
						relatedCollection: { equals: 'posts' },
					}
				},
				maxDepth: 0, // include the entire post-category (as it is not much data) <-- CHECK: If we really need this!
				hasMany: true,
				/* admin: {
					description: {
						de: 'Mithilfe dieser Kategorien können gezielt Posts an dieser Stelle eingebunden werden.'
					}
				}, */
				/* hooks: {
					afterChange: [
						async (args) => {
							try {
								if (args.value) {
									await updateRelationArray(args, 'posts-categories', 'relPages')
								}
								return args.value
							} catch (err) {
								reportError(err, args.req)
							}
						},
					]
				} */
			},
			// --- group: meta
			{
				type: 'group',
				name: 'meta',
				label: {
					de: 'Meta-Daten',
					en: 'Meta Data'
				},
				fields: [
					{
						type: 'row',
						fields: [
							// --- meta.include
							{
								type: 'select',
								name: 'include',
								label: {
									de: 'Welche Meta-Informationen sollen für jeden Post angezeigt werden?',
									en: 'Which meta data to show for each post?'
								},
								hasMany: true,
								admin: {
									width: '100%',
									isClearable: true,
								},
								options: [
									{
										value: 'title',
										label: {
											de: 'Titel',
											en: 'Title'
										}
									},
									{
										value: 'date',
										label: {
											de: 'Datum',
											en: 'Date'
										}
									},
									{
										value: 'tags',
										label: {
											de: 'Tags',
											en: 'Tags'
										}
									},
									{
										value: 'summary',
										label: {
											de: 'Zusammenfassung',
											en: 'Summary'
										}
									},
									{
										value: 'image',
										label: {
											de: 'Bild',
											en: 'Image'
										}
									},
								],
								defaultValue: ['title', 'date'],
							},
							// --- dateStyle
							{
								type: 'select',
								name: 'dateStyle',
								label: {
									de: 'Datumsformat',
									en: 'Date Style'
								},
								admin: {
									condition: (_, siblingData) => siblingData?.include?.includes('date'),
									width: '30%',
								},
								options: [
									{
										value: 'short',
										label: {
											de: '22.05.23',
											en: '5/22/23'
										}
									},
									{
										value: 'long',
										label: {
											de: '22. Mai 2023',
											en: 'May 22, 2023'
										}
									},
									{
										value: 'full',
										label: {
											de: 'Montag, 22. Mai 2023',
											en: 'Monday, May 22, 2023'
										}
									},
									{
										value: 'year',
										label: {
											de: '2023',
											en: '2023'
										}
									},
								],
								defaultValue: 'short',
							},
							/* { 
								type: 'checkbox',
								name: 'includeTime',
								label: {
									de: 'Zeit einbeziehen?',
									en: 'Include Time?'
								},
								admin: {
									condition: (_, siblingData) => siblingData?.useAsTitle === 'date',
									width: '30%',
								},
								defaultValue: false,
							}, */
						] // end of row
					},
					// --- meta.isCollapsible
					{
						type: 'checkbox',
						name: 'isCollapsible',
						label: {
							de: 'Zusammenklappbar',
							en: 'Collapsible'
						},
						defaultValue: true,
						admin: {
							condition: (data) => (data.editingMode === 'layout') ? true : false
						},
					},
					// --- meta.initState
					{
						type: 'radio',
						name: 'initState',
						label: {
							de: 'Ausgangszustand',
							en: 'Initial State'
						},
						admin: {
							condition: (data, siblingData) => (data.editingMode === 'layout' && siblingData.isCollapsible === true) ? true : false
						},
						options: [
							{
								value: 'collapsed',
								label: {
									de: 'Zusammengeklappt',
									en: 'Collapsed'
								}
							},
							{
								value: 'expanded',
								label: {
									de: 'Auseinandergeklappt',
									en: 'Expanded'
								}
							},
						],
						defaultValue: 'collapsed',
					}
				]
			},
			// --- group: content
			{
				type: 'group',
				name: 'content',
				label: {
					de: 'Inhalt',
					en: 'Content'
				},
				admin: {
					condition: (data) => (data.editingMode === 'layout') ? true : false
				},
				fields: [
					{
						type: 'row',
						fields: [
							// --- includeContentAs
							/* {
								type: 'radio',
								name: 'includeAs', // what happens if we click on the post's title?
								label: {
									de: 'Wie sollen die Inhalte der Posts eingebunden werden?',
									en: "How to include the post's content?",
								},
								options: [
									{
										value: 'rendered',
										label: 'Rendered'
									},
									{
										value: 'renderedOnView',
										label: 'Rendered on view'
									},
									{
										value: 'renderedOnClick',
										label: 'Rendered on click'
									}
								],
								defaultValue: 'rendered',
							}, */
							// initRenderedCount
							/* {
								type: 'number',
								name: 'initRenderedCount',
								label: 'Initially render',
								defaultValue: 7,
								admin: {
									condition: (data, siblingData) => {
										if (siblingData.includeAs !== 'rendered') {
											return true;
										} else {
											return false;
										}
									}
								}
							}, */
						]
					},
					// --- content.sortBy
					{
						type: 'radio',
						name: 'sortBy',
						label: {
							de: 'Sortierung',
							en: 'Order',
						},
						options: [
							{
								value: 'date',
								label: {
									en: 'Date',
									de: 'Datum'
								}
							},
							{
								value: 'tags',
								label: {
									en: 'Tags',
									de: 'Tags'
								}
							},
						],
						defaultValue: 'date',
					},
				]
			},
			// --- ui
			{
				type: 'group',
				name: 'ui',
				label: {
					de: 'Benutzeroberfläche',
					en: 'User Interface'
				},
				fields: [
					// --- ui.include
					{
						type: 'select',
						name: 'include',
						label: {
							de: 'Welche Bedienelemente sollen angezeigt werden?',
							en: 'Which settings affecting all posts should be shown to the user?'
						},
						hasMany: true,
						admin: {
							isClearable: true,
						},
						options: [
							{
								value: 'tags',
								label: {
									de: 'Filter nach Tags',
									en: 'Filter by tags'
								}
							},
							{
								value: 'sortorder',
								label: {
									de: 'Sortierung',
									en: 'Sort Order'
								}
							},
							{
								value: 'searchbar',
								label: {
									de: 'Suchleiste',
									en: 'Searchbar'
								}
							},
							{
								value: 'toc',
								label: {
									de: 'Inhaltsverzeichnis',
									en: 'Table of Contents'
								}
							},
							{
								value: 'backToTopButton',
								label: {
									de: 'Back-to-Top Button',
									en: 'Back-to-Top Button'
								}
							},
						],
						defaultValue: [],
					},
				]
			},
		]
	}

	return block
}

async function updateRelationArray(args, destCol = 'post-categories', destField = 'relPages') {
	// afterChange
	// relationship field hook

	// update post-categories about the references that this pages makes to them

	const pageID = args.originalDoc.id
	const user = args?.req?.user?.shortName

	if (!args.value) {
		return
	}
	if (args.operation === 'update') {

		const catIDsCurr = args.value
		const catsPrev = args.previousSiblingDoc.categories
		const locale = args.req.locale
		const siteID = args.originalDoc.site

		if (catIDsCurr.toString() === catsPrev.toString()) {
			return // return if nothing has changed
		}

		const query = {
			site: {
				equals: siteID
			}
		}
		const postCategoriesBefore = await getCol(destCol, user, { where: query })

		let postCategoriesChanged = []

		for (const cat of postCategoriesBefore.docs) {
			// cats removed
			if (cat.relPages && cat.relPages.includes(pageID) && !catIDsCurr.includes(cat.id)) {
				// 1. cat.relPages exists
				// 2. cat.relPages currently includes pageID
				// 3. page does not include catID any more
				cat.relPages = cat.relPages.filter(pID => pID !== pageID)
				postCategoriesChanged.push(cat)
			}
			// cats added
			else if (catIDsCurr.includes(cat.id) && !cat.relPages) {
				// 1. page includes catID
				// 2. cat.relPages does not exist
				cat.relPages = [pageID]
				postCategoriesChanged.push(cat)
			}
			// cats added
			else if (catIDsCurr.includes(cat.id) && !cat.relPages.includes(pageID)) {
				// 1. page includes catID
				// 2. cat.relPages does not include pageID
				cat.relPages.push(pageID)
				postCategoriesChanged.push(cat)
			}
		}

		// update collection post-categories
		for (const cat of postCategoriesChanged) {

			await updateDocSingle(destCol, cat.id, user, { data: cat, locale: locale })
		}

	}

}