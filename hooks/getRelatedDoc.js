import payload from 'payload'
import log from '../helpers/customLog'

export default async function getRelatedDoc(colSlug = '', ref, user = '', { depth = 0, locale = '' } = {}) {
	/*
		Receives:
			A doc-id or a doc-object
		Task:
			Get the doc-object if necessary
		Return:
			The doc-object
	*/

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