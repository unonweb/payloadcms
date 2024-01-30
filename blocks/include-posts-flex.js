export default function createIncludePostsFlexBlock() {
	const block = {
		slug: 'include-posts-flex',
		labels: {
			singular: {
				en: 'Posts Flex',
				de: 'Posts Flex'
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
				hasMany: false,
			},
			// --- block.sortBy
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
			{
				type: 'collapsible',
				label: {
					de: 'Benutzeroberfläche',
					en: 'User Interface'
				},
				admin: {
					initCollapsed: true,
				},
				fields: [
					// --- block.ui
					{
						type: 'group',
						name: 'ui',
						label: ' ',
						admin: {
							hideGutter: true,
							className: 'hide-group-label'
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
								defaultValue: true,
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
		]
	}

	return block
}