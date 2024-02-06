import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import rmFile from '../../helpers/_rmFile'
import getDoc from '../getDoc'

export default async function removePrevPage({ operation, doc, previousDoc, context, req }) {
	/* 
		afterChange
		collectionHook
	*/
	try {
		const site = context.site
		const user = context.user
		const pathSite = `${context.site.paths.fs.site}/${context.mode}`
		const currSiteID = (typeof doc.site === 'string') ? doc.site : doc.site.id
		const prevSiteID = (typeof previousDoc.site === 'string') ? previousDoc.site : (typeof previousDoc.site === 'object') ? previousDoc.site.id : null

		/* remove previous page if slug changes */
		if (doc.slug !== previousDoc.slug && previousDoc.slug !== '') {
			// slug has changed and is not empty
			for (const loc of site.locales.used) {
				await rmFile(`${pathSite}/${loc}/${previousDoc.slug}`, user, { recursive: true, throwErrorIfMissing: false }) // remove former directory if slug has changed
			}
		}

		/* remove previous page if site changes */
		if (operation === 'update' && currSiteID !== prevSiteID) {
			// slug has changed and is not empty
			const prevSite = await getDoc('sites', previousDoc.site, user, { depth: 0 })
			for (const loc of site.locales.used) {
				await rmFile(`${prevSite.paths.fs.site}/dev/${loc}/${previousDoc.slug}`, user, { recursive: true, throwErrorIfMissing: false }) // remove former directory
				await rmFile(`${prevSite.paths.fs.site}/prod/${loc}/${previousDoc.slug}`, user, { recursive: true, throwErrorIfMissing: false }) // remove former directory
			}
		}
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
		mailError(error)
	}
}