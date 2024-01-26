import log from '../../customLog'
import payload from 'payload'

export default async function resetBrokenRelationship(callingCollection = '', fieldName = '', { data, originalDoc, value, field, context } = {}) {
	/* 
		Hook: beforeValidate
		Task: Resets the relationship value if it's broken
		Limits: 
			- Use only on top level fieldName
		Arguments:
			- value is not set in updates triggered externally
			- data has the new values
			- originalDoc has the old values
	*/
	
	try {
		const relationTo = field.relationTo
		const relationID = value ?? data[fieldName] ?? originalDoc[fieldName] // required because see arguments

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
				log(`Could not find "${relationID}" in "${relationTo}" referenced from "${callingCollection}"\n--> Reset relationship.`, context.user, __filename, 4)
				return null
			default:
				log(error.stack, context.user, __filename, 3)
		}
	}
}