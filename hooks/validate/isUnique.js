export default async function isUnique(slug = '', fieldName = '', fieldValue, { data, payload }) {
	/* 
		Called on the backend
		Task:
			Check in the given collection 'slug' 
			if there's a field 'fieldName'
			with them same value 'fieldValue'
		Returns:
			either true or a string error message 
	*/	
	if (payload) {
		const result = await payload.find({
			collection: slug,
			depth: 0,
			pagination: false,
			where: {
				and: [
					{
						site: { equals: data.site } // all docs associated with the same site
					},
					{
						id: { not_equals: data.id } // but with different id
					},
					{
						[fieldName]: { equals: fieldValue } // that has the same value
					}
				]
			},
		})

		if (result.docs.length === 0) {
			return true
		} 
		else {
			return `Wert muss einzigartig sein!`
		}
	} else {
		// if payload is not defined 
		// skip the client side validation
		return true
	}
}