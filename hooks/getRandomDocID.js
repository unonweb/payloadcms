import log from '../customLog'
import getRandomInt from './_getRandomInt'
import payload from 'payload'

export default async function getRandomDocID(colSlug = '', user = '') {
	/* 
		Task: Returns a random doc id from the given collection 
		Limits: Use only on collections without user dependent access control
	*/
	
	try {
		const result = await payload.find({ // Result will be a paginated set of Posts.
			collection: colSlug,
			depth: 0,
		})

		const randomIndex = getRandomInt(0, result.docs.length)
		return result.docs[randomIndex].id

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}

async function getRandomDocIDFetch(colSlug = '', user = '') {
	/*
		Tasks: Return a random doc id from the given collection
		Limits: Works only if called in the frontend admin panel (defaultValue)
	*/
	
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