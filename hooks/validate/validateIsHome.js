export default async function validateIsHome(fieldValue, data, payload, t) {
	// validate function
	// collection: 'pages'
	// field: 'isHome'
	// returns true if true
	// returns a string if false

	let isValid

	if (payload) {

		const otherHPs = await payload.find({
			collection: 'pages',
			depth: 0,
			pagination: false,
			where: {
				and: [
					{
						id: { not_equals: data.id } // all pages associated with the same site
					},
					{
						site: { equals: data.site } // all pages associated with the same site
					},
					{
						isHome: { equals: true }
					}
				]
			},
			locale: 'all'
		})

		if (fieldValue === true) {
			if (otherHPs.docs.length === 0) {
				// this is the only page set as hp
				isValid = true	
			}
			else if (otherHPs.docs.length > 0) {
				// there are other pages set as homepage
				
				/* isValid = t({
					en: "There's another page already set as homepage. Please remove this first.",
					de: "Sorry"
				}) */
	
				isValid = "There's another page already set as homepage. Please remove this first."
			}
		}
		else if (fieldValue === false) {
			if (otherHPs.docs.length > 0) {
				// this is NOT the homepage but there's another
				isValid = true	
			}
			else if (otherHPs.docs.length === 0) {
				// if this is NOT the homepage and there's no other
				//isValid = "Please set at least one page as your homepage." // <-- impossible to switch from one hp to another
				isValid = true
			}
		}
	} else {
		// if payload is not defined 
		// skip the client side validation
		isValid = true
	}

	return isValid
}

async function validateIsHomeBrowser(fieldValue, data) {

	let isValid

	if (fieldValue === true) {
		// this page is set as homepage

		const pageID = data.id ?? data._id

		// query
		const query = qs.stringify({
			and: [
				{
					site: { equals: data.site } // all pages associated with the same site
				},
				{
					isHome: { equals: true }
				}
			]
		})
		// fetch
		let homepages = await fetch(`/api/pages?depth=0&where${query}`)
		// response
		if (homepages.ok) {
			homepages = await homepages.json()
			// validate
			if (homepages.docs.length > 1) {
				// there are other pages set as homepage
				console.log(homepages.docs)
				isValid = false
			}
		} else {
			// this is the only page set as hp
			isValid = true
		}
	} else {
		// if fieldValue is false
		isValid = true
	}

	console.log(`validateIsHomeBrowser: ${isValid}`)
	return isValid
}