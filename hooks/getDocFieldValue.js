//import findByID from 'payload/dist/collections/operations/findByID'
import payload from 'payload'

export default async function getDocFieldValue(colSlug, docID, field = '') {
	// RESTRICCTION:
	// works only with top level fields
	// returns a string

	try {
		const doc = await payload.findByID({
			collection: colSlug,
			id: docID,
		})
		if (!doc[field]) {
			throw ReferenceError(`could not find ${field} in ${doc}`)
		}

		return doc[field]
		
	} catch (error) {
		console.error(error)
	}
}