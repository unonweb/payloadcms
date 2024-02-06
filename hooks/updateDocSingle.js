import payload from 'payload'
import log from '../helpers/customLog'

export default async function updateDocSingle(colSlug = '', id = '', user = '', { data = {}, locale = '', context = {} } = {}) {
	// updates many if 'docID' is omitted and 'where' is given
	// updates a single doc if 'docID' is given and 'where' is omitted
	// result will be the updated Post document

	if (id === '') {
		throw new Error('id is empty')
	}

	try {
		const doc = await payload.update({
			collection: colSlug,
			id: id,
			data: data,
			locale: locale,
			context: context,
			overrideAccess: true, // Skip access control. By default, this property is set to true within all Local API operations
			showHiddenFields: false, // Opt-in to receiving hidden fields. By default, they are hidden from returned documents in accordance to your config
		})

		let title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName ?? doc.domain
		
		if (typeof title === 'object') {
			title = title[Object.keys(title)[0]] // select first property of title object
		}

		log(`updated "${title}" in "${colSlug}"`, user, __filename, 7)

		return doc

	} catch (err) {
		log(`could not update doc "${id}" in "${colSlug}"`, user, __filename)
		log(err.stack, user, __filename, 3)
	}
}