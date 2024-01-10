import log from '../customLog'
import getRandomInt from './_getRandomInt'

export default async function getRandomDocID(colSlug = '', user = '') {
	// returns a random doc id from the given collection
	try {
		if (user) {
			const res = await fetch(`/api/${colSlug}`)
			if (res.ok) {
				const data = await res.json()
				const randomIndex = getRandomInt(0, data.docs.length)
				return data.docs[randomIndex].id
			}
		}	
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}