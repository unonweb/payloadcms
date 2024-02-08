import payload from 'payload'
import log from '../helpers/customLog'

export default async function getCol(colSlug, username = '', { depth = 0, pagination = false, where = {}, locale = '', overrideAccess = true, user = null } = {}) {
	/*
		Get payload collection
	*/
	const result = await payload.find({ // Result will be a paginated set of Posts.
		collection: colSlug,
		depth: depth,
		pagination: pagination,
		where: where,
		locale: locale,
		overrideAccess: overrideAccess,
		user: user,
	})

	if (result.docs.length === 0) {
		log(`no docs found in "${colSlug}" with "${locale}" and ${JSON.stringify(where)}`, username, __filename, 5)
	} else {
		log(`got ${result.docs.length} from "${colSlug}"`, username, __filename, 7)
	}

	return result
}