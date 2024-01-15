export default function createHTMLFields() {
	const field = {
		type: 'group',
		name: 'html',
		admin: {
			condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
		},
		fields: [
			{
				// --- doc.html.main
				type: 'code',
				name: 'main',
				localized: true,
				admin: {
					language: 'html',
				}
			},
			// --- doc.html.head
			{
				type: 'code',
				name: 'head',
				localized: true,
				admin: {
					language: 'html',
				}
			},
		]
	}

	return field
}