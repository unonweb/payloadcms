import log from '../helpers/customLog'
import payload from 'payload'

export default async function updateRelatedPages(fieldName = '', fieldID = '', siteID = '', locale = '', user = '') {
	/* updated all sites that use this top lvl field */
	try {
		const result = await payload.update({
			collection: 'pages',
			where: {
				and: [
					{ site: { equals: siteID } },
					{ [fieldName]: { equals: fieldID } },
				]
			},
			data: {
				updatedBy: `${fieldName}-${Date.now()}`
			},
			locale: locale // <-- ATT! Changes in menus have to saved for each locale separately
		})

		if (result.docs.length === 0) {
			log(`no doc found with "${fieldName}=${fieldID}"`, user, __filename, 5)
		}

		for (const doc of result.docs) {
			log(`updated "${doc.slug}"`, user, __filename, 7)	
		}

		for (const error of result.errors) {
			throw new Error(`${error.message} (while updating "${fieldID}")`)
		}

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}