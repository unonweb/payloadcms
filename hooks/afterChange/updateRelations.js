import payload from 'payload'
import getRelatedDoc from '../getRelatedDoc'
import log from '../../customLog'
import mailError from '../../mailError'

export default async function updateRelations(destSlug = '', destFieldName = '', { req, doc, previousDoc, operation, context }) {
	/*
		Type:
			afterChange
			collectionHook
		Tasks:
		- update pages
	*/
	try {
		context.site ??= await getRelatedDoc('sites', doc.site, user)
		const user = context.user
		const host = context.host
		const site = context.site
		const mode = context.mode

		/* update pages */
		if (host === 'lem' || doc.html !== previousDoc.html) {
			//  || doc?.imgs?.toSorted()?.toString() !== previousDoc?.imgs?.toSorted()?.toString()
			if (operation === 'update') {
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
							updatedBy: `${destFieldName}-${Date.now()}`
						},
						locale: loc,
						context: {
							updatedByPageElement: true, // may be overwriten by former context
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
			}
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
	}
}

/* await updateDocsMany('pages', user, {
	depth: 0,
	locale: loc,
	where: {
		and: [
			{ site: { equals: doc.site } },
			{ nav: { equals: doc.id } },
		]
	},
	data: {
		html: {
			nav: doc.html
		}
	},
	context: context
}) */