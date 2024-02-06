//import findByID from 'payload/dist/collections/operations/findByID'
import payload from 'payload'
import CustomError from '../helpers/customError'

export default async function extractFieldsFromRelationship(args, fieldsToExtract = []) {
	// afterRead
	// field hook
	// called by link-internal
	// RESTRICCTION:
	// works only with top level fields

	if (args.value) { 
		// if 'relationTo' and 'value' are set
		const user = args?.req?.user?.shortName
		const refCol = args.value.relationTo
		const refID = args.value.value

		const doc = await payload.findByID({
			collection: refCol,
			id: refID,
			locale: 'all'
		})
	
		const extract = {}
	
		fieldsToExtract.map(field => {
			if (doc[field] !== undefined) {
				extract[field] = doc[field]
			} else {
				throw new CustomError(`${field} in ${doc.title} is undefined`, user, __filename)
			}
		})

		if (!extract) {
			throw new CustomError('extract is empty', user, __filename)
		}

		// include this - otherwise the admin UI will not work properly
		extract.relationTo = refCol 
		extract.value = refID

		return extract

	} else {
		return // just the id
	}
}