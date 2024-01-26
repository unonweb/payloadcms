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
						relatedCollection: { equals: 'postsFlex' },
					}
				},
				maxDepth: 0, // include the entire post-category (as it is not much data) <-- CHECK: If we really need this!
				hasMany: true,
			},
		]
	}

	return block
}