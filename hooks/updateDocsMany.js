import payload from 'payload'
import log from '../customLog'

export default async function updateDocsMany(colSlug = '', user = '', { where = {}, data = {}, context = {}, locale = '', depth = 0, overrideAccess = true } = {}) {
	try {
		// data required
		if (!Object.keys(data).length === 0) {
			throw new Error('data is empty')
		}

		const result = await payload.update({
			collection: colSlug,
			where: where,
			data: data,
			locale: locale,
			depth: depth,
			overrideAccess: overrideAccess,
			context: context,
		})

		if (result.docs.length === 0) {
			log(`no doc found in "${colSlug} with ${JSON.stringify(where)}`, user, __filename, 5)
		}

		for (const doc of result.docs) {
			const title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName ?? doc.domainShort
			log(`updated doc "${title}" in ${colSlug}`, user, __filename)
		}
	
		for (const error of result.errors) {
			throw new Error(`error when trying to update "${error.id}" in "${colSlug}": "${error.message}"`)
		}
	
		return result	

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}