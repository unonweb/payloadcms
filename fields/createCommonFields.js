export default function createCommonFields() {
	const fields = [
		// --- createdByID
		{
			type: 'relationship',
			relationTo: 'users',
			name: 'createdByID',
			label: {
				de: 'Erstellt von ID',
				en: 'Created by ID'
			},
			maxDepth: 0,
			hasMany: false,
			defaultValue: ({ user }) => (user) ? user.id : null,
			admin: {
				condition: (data, siblingData, { user }) => user && user.roles.includes('admin'),
			},
		},
		// --- createdByName
		{
			type: 'text',
			name: 'createdByName',
			label: {
				de: 'Erstellt von Benutzer',
				en: 'Created by User'
			},
			defaultValue: ({ user }) => (user) ? `${user.firstName} ${user.lastName}` : '',
			admin: {
				condition: (data, siblingData, { user }) => user && user.roles.includes('admin'),
			}
		},
		// --- updatedBy
		{
			type: 'text',
			name: 'updatedBy',
			admin: {
				hidden: true
			}
		},
	]

	return fields
}