export default function isAdminOrAuthor(fieldName = 'createdByID') {
	return function ({ req: { user } }) {
		if (user) {
			// Need to be logged in
			if (user.roles?.includes('admin')) {
				return true;
			}
			// If any other type of user, only provide access to themselves
			return {
				[fieldName]: { equals: user.id }
			}
		} else {
			return false
		}
	}
}