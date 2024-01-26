import log from '../../customLog'
import payload from 'payload'

export default async function resetBrokenRelationship(relationID = '', { data, originalDoc, value, field, collection, req } = {}) {
	/* 
		Hook: 
			beforeValidate
		Order:
			- after beforeOperation
		Task: 
			- Reset the relationship value if it's broken
		Arguments:
			- value is not set in updates triggered externally
			- data has the new values
			- originalDoc has the old values
	*/
	
	try {
		const relationTo = field.relationTo

		if (relationID) {
			const result = await payload.findByID({
				collection: relationTo,
				id: relationID,
				depth: 0,
			})	
		}
	} catch (error) {
		switch (error.name) {
			case 'NotFound':
				log(`Could not find "${relationID}" in "${relationTo}" referenced from "${collection.slug}"\n--> Reset relationship.`, req?.user?.shortName, __filename, 4)
				return null
			default:
				log(error.stack, req?.user?.shortName, __filename, 3)
		}
	}
}