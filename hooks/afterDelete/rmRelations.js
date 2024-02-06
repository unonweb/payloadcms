import payload from 'payload'
import log from '../../helpers/customLog'

export default async function removeRelations(destSlug = '', destFieldName = '', { req, id }) {
	/*
		Type:
			- afterDelete
			- Collection Hook
		Tasks:
			Remove relationship with docID in collection 'destSlug'
	*/
	try {
		

		const result = await payload.update({
			collection: destSlug,
			where: {
				and: [
					{ site: { equals: req.context.site.id } },
					{ [destFieldName]: { equals: id } },
				]
			},
			data: { [destFieldName]: '' },
			context: req.context
		})

		if (result.docs.length === 0) {
			log(`no doc found in "${destSlug} with "${destFieldName}=${id}"`, req.context.user, __filename, 6)
		} 
		else {
			log(`updated "${result.docs.length}" in ${destSlug}`, req.context.user, __filename)
		}
	
		/* for (const doc of result.docs) {
			const title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName ?? doc.domainShort
			log(`updated doc "${title}" in ${destSlug}`, context.user, __filename)
		} */
	
		for (const error of result.errors) {
			throw new Error(`error when trying to update "${error.id}" in "${destSlug}": "${error.message}"`)
		}

	} catch (error) {
		log(error.stack, req.context.user, __filename)
	}
}