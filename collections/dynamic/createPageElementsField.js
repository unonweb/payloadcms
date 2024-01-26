import getDefaultDocID from '../../hooks/getDefaultDocID'

export default function createElementsFields() {
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
			// --- element.header
			{
				type: 'relationship',
				name: 'header',
				maxDepth: 0, // only return id
				relationTo: 'headers',
				required: false,
				defaultValue: async ({ user }) => (user) ? await getDefaultDocID('headers', user.shortName) : '',
			},
			// --- element.nav
			{
				type: 'relationship',
				name: 'nav',
				maxDepth: 0, // only return id
				relationTo: 'navs',
				required: false,
				defaultValue: async ({ user }) => (user) ? await getDefaultDocID('navs', user.shortName) : '',
			},
			// --- element.footer
			{
				type: 'relationship',
				name: 'footer',
				maxDepth: 0, // only return id
				relationTo: 'footers',
				required: false,
				defaultValue: async ({ user }) => (user) ? await getDefaultDocID('footers', user.shortName) : '',

			},
		]
	}

	return field
}