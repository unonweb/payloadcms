export default async function firstDefaultsToTrue(colSlug = '', user = '') {
	/* 
		Called on the FRONTEND
		Tasks:
		- Return true if this is the first doc in this collection associated with this user
		Limits:
		- Does not work if a user has multiple sites
	*/
	if (user) {
		const res = await fetch(`/api/${colSlug}`)
		if (res.ok) {
			const data = await res.json()
			console.log(`firstDefaultsToTrue() `, data)
			if (data.docs.length === 0) {
				return true
			} else {
				return false
			}
		}
	}
}