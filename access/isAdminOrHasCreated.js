export default async function ({ req: { user } }) {
	if (user) {
		if (user.roles.includes('admin')) {
			return true
		}
		if (user.roles.includes('editor')) {
			
			let query = {
				createdByID: { equals: user.id }
			}

			return query // return a query constraint which limits the documents that are returned to only those that match the constraint you provide.
		}
	} else {
		return false
	}
}