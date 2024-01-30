export default async function getFirstDocID({ user }) {
	if (user) {
		const res = await fetch('/api/images')
		if (res.ok) {
			const data = await res.json()
			if (data?.docs[0]?.id) {
				return data.docs[0].id
			} else {
				return null
			}
		}
	}
}