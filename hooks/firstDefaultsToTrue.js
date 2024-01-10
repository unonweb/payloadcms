export default async function firstDefaultsToTrue(colSlug = '', user = '') {
	if (user) {
		const res = await fetch(`/api/${colSlug}`)
		if (res.ok) {
			const data = await res.json()
			if (data.docs.length === 0) {
				return true
			} else {
				return false
			}
		}
	}
}