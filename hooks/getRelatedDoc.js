import payload from 'payload'
import log from '../helpers/customLog'

export default async function getRelatedDoc(colSlug = '', ref, user = '', { depth = 0, locale = '' } = {}) {
	// receives a doc-id or a doc-object
	// gets the doc-object if necessary
	// returns the doc-object

	try {
		switch (typeof ref) {
			case 'object':
				return ref
			case 'string':
				const doc = await payload.findByID({
					collection: colSlug,
					id: ref,
					depth: depth,
					locale: locale,
				})
				const title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName ?? doc.domainShort
				log(`from "${colSlug}" got "${title}" with locale "${locale}"`, user, __filename, 7)

				return doc
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}