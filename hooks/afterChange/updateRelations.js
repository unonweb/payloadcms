import payload from 'payload'
import getRelatedDoc from '../getRelatedDoc'
import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'

export default async function updateRelations(destSlug = '', destFieldName = '', { req, doc, previousDoc, operation, context }) {
	/*
		Type:
			afterChange
			collectionHook
		Called by:
			- Headers
			- Footers
			- Navs
		Tasks:
		- update pages
	*/
	try {
		if (!req.user) return
		if (context.isFullUpdate) return
		if (operation === 'create') return
		if (host !== 'lem' && doc.html === previousDoc.html) return
		//  doc?.imgs?.toSorted()?.toString() !== previousDoc?.imgs?.toSorted()?.toString()

		context.site ??= await getRelatedDoc('sites', doc.site, user)
		const user = context.user
		const host = context.host
		const site = context.site
		const mode = context.mode

		// doesn't make sense during creating as it can't be referenced by a page at this point
		for (const loc of site.locales.used) {
			const result = await payload.update({
				collection: destSlug,
				where: {
					and: [
						{ site: { equals: doc.site } },
						{ [destFieldName]: { equals: doc.id } },
					]
				},
				data: {
					updatedBy: destFieldName
				},
				locale: loc,
				context: {
					isUpdatedByCode: true,
					skipSetMainHTML: true, // may be overwriten by former context
					...context,
				},
			})

			for (const error of result.errors) {
				throw new Error(`${error.message}\nUpdating "${error.id}" in "pages")`)
			}

			if (result.docs.length === 0) {
				log(`no doc found with "${destFieldName}=${doc.id}"`, user, __filename, 5)
			}
			else {
				log(`updated "${result.docs.length}" docs in "${destSlug}"`, user, __filename, 7)
			}
		}


	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err)
	}
}