import payload from 'payload'
import CustomError from './customError'
import log from './customLog'

export default async function rmDocs(colSlug, user = '', { where = {}, locale = 'all' } = {}) {
	try {
		const result = await payload.delete({
			collection: colSlug,
			where: where,
			depth: 0,
			locale: locale,
		})
	
		if (!result.docs) {
			throw CustomError(`no docs to remove in ${colSlug}`, user, __filename, 4)
			
		}
		
		for (const doc of result.docs) {
			const title = doc.title ?? doc.title ?? doc.slug ?? doc.name ?? doc.shortName ?? doc.domainShort
			log(`removed doc "${title}" in ${colSlug}`, user, __filename)
		}
	
		for (const error of result.errors) {
			log(`error when trying to delete docs in "${colSlug}": "${error.message}"`, user, __filename, 5)
			//throw new CustomError(`${error.message}"`, user, __filename)
		}	
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}