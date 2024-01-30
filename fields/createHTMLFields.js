export default function createHTMLFields(...names) {

	names ??= ['head', 'main', 'page']
	let _fields = []

	for (const name of names) {
		_fields.push(
			{
				type: 'code',
				name: name,
				localized: true,
				admin: {
					language: 'html',
				},
			}
		)
	}

	const field = {
		type: 'group',
		name: 'html',
		admin: {
			condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
		},
		fields: _fields
	}

	return field
}