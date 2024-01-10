export default async function validateIsDefault(fieldValue, data, payload, colSlug = '') {
	// return either true or a string error message

	if (fieldValue === false) {
		return true
	} 
	
	if (payload) {
		const result = await payload.find({
			collection: colSlug,
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
						isDefault: { equals: true } // that are set as defaults
					}
				]
			},
		})

		if (result.docs.length === 0) {
			return true
		} else {
			return `Nur ein "${colSlug}"-Element kann als Standard gesetzt werden`
		}
	} else {
		// if payload is not defined 
		// skip the client side validation
		return true
	}
}