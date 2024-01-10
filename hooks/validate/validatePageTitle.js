export default async function validatePageTitle(fieldValue, data, payload, t) {
	// validate function
	// collection: 'pages'
	// field: 'title'
	// returns true if true
	// returns a string if false (!)

	if (!fieldValue) {
		return 'required'
	}

	if (fieldValue === 'home' ) {
		return '"home" is reserved as special keyword, sorry'
	}

	if (payload) {
		// check if there're other pages with the same title
		const otherPagesWithSameTitle = await payload.find({
			collection: 'pages',
			depth: 0,
			pagination: false,
			locale: data.locale,
			where: {
				and: [
					{
						id: { not_equals: data.id } // all pages associated with the same site
					},
					{
						site: { equals: data.site } // all pages associated with the same site
					},
					{
						title: { equals: data.title }
					}
				]
			},
		})

		if (otherPagesWithSameTitle.docs.length > 0) {
			return `There's already another page with the same title. This is not allowed.`
		}
	}
}