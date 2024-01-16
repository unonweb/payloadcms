export default function createAssetsFields(...names) {
	/*	returns a group with the desired number of asset fields, e.g. 
		assets.imgs, assets.docs, assets.head
	*/
	
	names ??= ['imgs', 'docs', 'head']
	const _fields = []

	for (const name of names) {
		_fields.push(
			{
				type: 'json',
				name: name,
				defaultValue: [],
			}
		)
	}
	
	const result = {
		type: 'group',
		name: 'assets',
		admin: {
			condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
		},
		fields: _fields
	}

	return result
}