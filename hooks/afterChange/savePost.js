import log from '../../customLog'
import mailError from '../../mailError'
import saveToDisk from '../_saveToDisk'

export default async function savePost(slug = '', { req, doc, context }) {
	/* 
		afterChange
		collectionHook
	*/
	try {
		if (doc.hasOwnPage === undefined || doc.hasOwnPage === true) {
			const user = context.user
			const mode = context.mode
			const site = context.site
	
			/* save this as own page */
			const destPath = `${site.paths.fs.site}/${mode}/${slug}/${doc.id}/${req.locale}/index.html` // <-- ATT: hard-coded value
			await saveToDisk(destPath, doc.html.page, user, { ctParentPath: true })
		}
	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error, req)
	}
}