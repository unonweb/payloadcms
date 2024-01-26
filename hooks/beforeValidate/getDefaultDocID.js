import payload from 'payload'
import log from '../../customLog'

export default async function getDefaultDocID({ data, originalDoc, value, field, req }) {
	/* 
		Hook: 
			beforeValidate
		Order:
			- after beforeOperation
		Task: 
			Return a) the id of the doc set as default in the given collection or b) null
		Limits: 
			- Use only on top level fieldName
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
				isDefault: { equals: true }
			}
		})

		if (result?.docs?.length === 0) {
			// if none
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

	} catch (error) {
		log(error.stack, req?.user?.shortName, __filename, 3)
	}
}