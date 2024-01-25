import log from '../customLog'
import payload from 'payload'

async function getDefaultDocIDLocalAPI(colSlug = '', user = {}) {
	/* 
		Task: Returns the id of the doc set as default in the given collection 
		Limits: 
			- Use only on collections without user dependent access control
			- Works only if called from the BACKEND

	*/
	try {

		const userSites = (typeof user.sites[0] === 'string') ? user.sites : user.sites.map(item => item.id) // make sure that we have an array of strings

		const result = await payload.find({
			collection: colSlug,
			depth: 0,
			where: {
				site: { in: userSites }, // does not make sense, right?
				isDefault: { equals: true }
			}
		})

		if (result?.docs?.length === 0) {
			// if none
			console.log(`no doc set as default in col "${colSlug}"`)
			return null
		} else if (result.docs.length === 1) {
			// if one
			return result.docs[0].id
		} else {
			// if many
			console.log(`multiple docs set as default in col "${colSlug}"`)
			console.log('choose the first one')
			return result.docs[0].id
		}

	} catch (err) {
		log(err.stack, user.shortName, __filename, 3)
	}
}

export default async function getDefaultDocID(colSlug = '', user = '') {
	/* 
		Task: Returns the id of the doc set as default in the given collection 
		To do:
			- Implement site restriction
		Limits: 
			- Works only if called from the FRONTEND
	*/
	try {
		if (user) {
			const res = await fetch(`/api/${colSlug}?where[isDefault][equals]=true`) // get only the default ones
			if (res.ok) {
				const data = await res.json()
				if (data?.docs?.length === 0)
					// if none
					return null
			} else if (data.docs.length === 1) {
				// if one
				return data.docs[0].id
			} else {
				// if many
				console.log(`multiple docs set as default in col "${colSlug}"`)
				console.log('choose the first one')
				return data.docs[0].id
			}
		}
	} catch (err) {
		console.error(err.stack)
	}
}