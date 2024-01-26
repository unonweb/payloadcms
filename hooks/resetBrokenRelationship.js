import log from '../customLog'
import payload from 'payload'

export default async function resetBrokenRelationship(relationTo = '', id = '', callingCollection = '', user = '') {
	/* 
		Task: Returns the id of the doc set as default in the given collection 
		Limits: 
			- Use only on collections without user dependent access control
			- Works only if called from the BACKEND
	*/
	try {
		if (id) {
			const result = await payload.findByID({
				collection: relationTo,
				id: id,
				depth: 0,
			})	
		}
	} catch (error) {
		switch (error.name) {
			case 'NotFound':
				log(`Could not find "${id}" in "${relationTo}" referenced from "${callingCollection}"\n--> Reset relationship.`, user, __filename, 3)
				return null
			default:
				log(err.stack, user, __filename, 3)
		}
	}
}