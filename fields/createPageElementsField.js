export default function createPageElementsField() {
	const field = {
		type: 'group',
		name: 'elements',
		label: {
			de: 'Elemente',
			en: 'Elements'
		},
		admin: {
			condition: (data) => data.hasOwnPage
		},
		fields: [
			// --- page.header
			{
				type: 'relationship',
				name: 'header',
				maxDepth: 0, // only return id
				relationTo: 'headers',
				required: false,
				defaultValue: async ({ user }) => {
					if (user) {
						const res = await fetch('/api/headers')
						if (res.ok) {
							const headers = await res.json()
							if (headers?.docs[0]?.id) {
								return headers.docs[0].id
							} else {
								return null
							}
						}
					}
				}
			},
			// --- page.nav
			{
				type: 'relationship',
				name: 'nav',
				maxDepth: 0, // only return id
				relationTo: 'navs',
				required: false,
				defaultValue: async ({ user }) => {
					if (user) {
						const res = await fetch('/api/navs')
						if (res.ok) {
							const navs = await res.json()
							if (navs?.docs[0]?.id) {
								return navs.docs[0].id
							} else {
								return null
							}
						}
					}
				}
			},
			// --- page.footer
			{
				type: 'relationship',
				name: 'footer',
				maxDepth: 0, // only return id
				relationTo: 'footers',
				required: false,
				defaultValue: async ({ user }) => {
					if (user) {
						const res = await fetch('/api/footers')
						if (res.ok) {
							const footers = await res.json()
							if (footers?.docs[0]?.id) {
								return footers.docs[0].id
							} else {
								return null
							}
						}
					}
				}
			},
		]
	}

	return field
}