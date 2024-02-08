import log from '../../helpers/customLog.js'
import updateDocsMany from '../../hooks/updateDocsMany.js'
import mailError from '../../helpers/mailError.js'

export default async function afterDeleteHook(colSingular = '', { req, doc, context }) {
	try {
		const user = req?.user?.shortName ?? 'internal'
		log('--- afterDelete ---', user, __filename, 7)
	
		const siteID = (typeof doc.site === 'string') ? doc.site : doc.site.id
		
		/* remove association with pages */
		await updateDocsMany('pages', user, {
			where: {
				and: [
					{ site: { equals: siteID } },
					{ [colSingular]: { equals: doc.id } },
				]
			},
			data: { [colSingular]: '' }
		})
		
		/* remove association with posts */
		await updateDocsMany('posts-flex', user, {
			where: {
				and: [
					{ site: { equals: siteID } },
					{ hasOwnPage: { equals: true } },
					{ [colSingular]: { equals: doc.id } },
				]
			},
			data: { [colSingular]: '' }
		})

	} catch (error) {
		log(err.stack, user, __filename, 3)
		mailError(err)
	}
}