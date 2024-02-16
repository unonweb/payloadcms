import showOptionsField from '../fields/showOptions'

export default function createIncludePostsBlock() {
	const block = {
		slug: 'include-posts-flex',
		labels: {
			singular: {
				en: 'Posts',
				de: 'Posts'
			},
		},
		fields: [
			// --- block.type
			{
				type: 'relationship',
				name: 'type',
				relationTo: 'post-types',
				label: {
					de: 'Welche Posts sollen einbezogen werden?',
					en: 'Which posts should be included?'
				},
				//maxDepth: 0, // include the entire post-category (as it is not much data) <-- CHECK: If we really need this!
				hasMany: false, // <-- IMP: If I enable this I must make sure that iterateBlocks passes all types as attribute to the element
			},
			// --- showOptions
			showOptionsField,
			// --- block.sortBy
			{
				type: 'radio',
				name: 'sortBy',
				label: {
					de: 'Sortierung',
					en: 'Order',
				},
				admin: {
					condition: (data, siblingData) => siblingData.showOptions
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
			// --- block.ui
			{
				type: 'group',
				name: 'ui',
				label: {
					de: 'Benutzeroberfläche',
					en: 'User Interface'
				},
				admin: {
					hideGutter: true,
					condition: (data, siblingData) => siblingData.showOptions,
				},
				fields: [
					// --- block.ui.isCollapsible
					{
						type: 'checkbox',
						name: 'isCollapsible',
						label: {
							de: 'Zusammenklappbar',
							en: 'Collapsible'
						},
						defaultValue: false,
					},
					// --- block.ui.initState
					{
						type: 'radio',
						name: 'initState',
						label: {
							de: 'Ausgangszustand',
							en: 'Initial State'
						},
						admin: {
							condition: (data, siblingData) => siblingData.isCollapsible
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
					},
					// --- block.ui.include
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