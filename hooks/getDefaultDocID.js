import log from '../customLog'

export default async function getDefaultDocID(colSlug = '', user = '') {
	// returns a random doc id from the given collection
	// fields: 
	// * defaultValue
	try {
		if (user) {
			const res = await fetch(`/api/${colSlug}`)
			if (res.ok) {
				const data = await res.json()
				//console.log(`getDefaultDocID(${colSlug}, ${user})`, data?.docs?.length)
				if (data?.docs?.length === 0) {
					// if none
					return null
				} else if (data.docs.length === 1) {
					// if one
					return data.docs[0].id
				} else {
					// if many
					return data.docs.find(item => item.isDefault === true)
				}
			}
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}