//import create from 'payload/dist/collections/operations/create'
import payload from 'payload'
import CustomError from '../customError'
import log from '../customLog'

export default async function createDoc(col = '', user = '', { locale = '', data = {} } = {}) {
	try {
		// returns the created doc
		const doc = await payload.create({
			collection: col,
			data: data,
			locale: locale
		})

		if (!doc) {
			throw new CustomError(`Could not create doc in "${col}"`, user, __filename)
		} else {
			const title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName
			log(`created doc "${title}" in "${col}"`, user, __filename, 6)
		}

		return doc
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}