export default async function hasDefaultSet(fieldValue, data, payload, colSlug = '') {
	/* 
		- called on the backend
		- return either true or a string error message 
	*/
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
						isDefault: { equals: true } // that are set as defaults
					}
				]
			},
		})

		if (result.docs.length === 0) {
			return `In "${colSlug}" ist kein Element als Standard gesetzt`
		} else if (result.docs.length > 1) {
			return `Es ist mehr als ein Element in "${colSlug}" als Standard gesetzt`
		} else {
			return true
		}
	} else {
		// if payload is not defined skip the client side validation
		return true
	}
}