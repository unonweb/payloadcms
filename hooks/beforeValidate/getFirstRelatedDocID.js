import payload from 'payload'
import log from '../../customLog'

export default async function getFirstRelatedDocID({ data, originalDoc, field, req }) {
	/* 
		Hook: 
			beforeValidate
		Order:
			- after beforeOperation
		Task: 
			Return a) the first id  doc set as default in the given collection or b) null
		Arguments:
			- value is not set in updates triggered externally
			- data has the new values
			- originalDoc has the old values
	*/
	try {

		const relationTo = field.relationTo
		const siteID = (data && typeof data.site === 'string') ? data.site 
			: (data && typeof data.site === 'object') ? data.site.id 
			: (originalDoc && typeof originalDoc.site === 'string') ? originalDoc.site 
			: null

		const result = await payload.find({
			collection: relationTo,
			depth: 0,
			where: {
				site: { equals: siteID },
			}
		})

		if (result?.docs?.length === 0) return null
		else return result.docs[0].id

	} catch (error) {
		log(error.stack, req?.user?.shortName, __filename, 3)
	}
}