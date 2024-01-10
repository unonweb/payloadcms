import payload from 'payload'
import log from '../customLog'

export default async function getDoc(colSlug = '', docID = '', user = '', { depth = 2, locale = 'all', fallbackLocale = true } = {}) {
	
	try {
		if (!docID) {
			throw new Error(`abort querying "${colSlug}" because docID is "${docID}"`)
		}

		const result = await payload.findByID({
			collection: colSlug,
			id: docID,
			depth: depth,
			locale: locale,
			fallbackLocale: fallbackLocale,
		})
	
		const title = result.title ?? result.slug ?? result.name ?? result.shortName ?? result.domainShort
		log(`from "${colSlug}" got "${title}" with locale "${locale}"`, user, __filename, 7)
		
		return result

	} catch (err) {
		log(`error while trying to find "${docID}" in "${colSlug}"`, user, __filename, 3)
		log(err.stack, user, __filename, 3)
	}
	
}