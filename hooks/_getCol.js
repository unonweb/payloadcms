import payload from 'payload'
import log from '../customLog'

export default async function getCol(colSlug, user = '', { depth = 0, pagination = false, where = {}, locale = '' } = {}) {
	/*
		Get payload collection
	*/
	const result = await payload.find({ // Result will be a paginated set of Posts.
		collection: colSlug,
		depth: depth,
		pagination: pagination,
		where: where,
		locale: locale
	})

	if (result.docs.length === 0) {
		log(`no docs found in "${colSlug}" with "${locale}" and ${JSON.stringify(where)}`, user, __filename, 5)
	} else {
		log(`got ${result.docs.length} from "${colSlug}"`, user, __filename, 7)
	}

	return result
}