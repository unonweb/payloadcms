import log from '../../customLog'
import getCol from '../_getCol'
import saveToDisk from '../_saveToDisk'
import getRelatedDoc from '../getRelatedDoc'

export default async function savePostsJson(slug = '', { args, operation, result }) {
	/*	
		Hook:
			afterOperation
		Attention: 
			- In bulk operation 'result' contains 'result.docs' and 'result.errors'
			- No context available
		Tasks:
			- FS: Save entire collection as posts.json
	*/

	if (!['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) return
	if (args.req.context.preventFsOps === true) return

	const user = args.req.context.user
	const mode = args.req.context.mode
	const locale = args.req.locale
	const docs = (Array.isArray(result.docs)) ? result.docs : [result] // wrap result in an array; necessary because of bulk operations

	for (const doc of docs) {
		// <-- IMP: Now when deleting multiple posts for each post this code is executed; basically only for different sites this code would need to be executed
		const site = await getRelatedDoc('sites', doc.site, user)

		/* save posts.json in this locale to disk */
		// get all posts
		const posts = await getCol(slug, user, {
			depth: 1,
			locale: locale,
			where: {
				site: { equals: site.id }
			},
		})

		const webVersion = createWebVersion(posts.docs, locale, args.req.user)
		const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${locale}/${slug}.json`
		await saveToDisk(destPath, JSON.stringify(webVersion), user)

		/* save posts.json in additional locale to disk */
		if (['delete', 'deleteByID'].includes(operation)) {
			for (const loc of site.locales.used.filter(loc => loc !== locale)) {
				const posts = await getCol(slug, user, {
					depth: 1,
					locale: loc,
					where: {
						site: { equals: site.id }
					},
				})

				const webVersion = createWebVersion(posts.docs, loc, args.req.user)
				const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${loc}/${slug}.json`
				await saveToDisk(destPath, JSON.stringify(webVersion), user)
			}
		}
	}
}

function createWebVersion(docs = [], locale = '') {

	docs = (docs.docs) ? docs.docs : docs
	docs = (!Array.isArray(docs)) ? [docs] : docs

	const postsWebVersion = docs.map(doc => {
		return {
			type: doc.type.id ?? doc.type,
			id: doc.id, // string
			tags: doc.tags, // object
			title: doc.title, // string
			html: doc.html?.main,
			author: doc.createdByName,
			dateStart: doc.date_start,
			dateEnd: doc.date_end,
			dateTime: doc.date_time,
			updatedAt: doc.updatedAt,
			createdAt: doc.createdAt,
			locale: locale,
		}
	})

	return postsWebVersion
}