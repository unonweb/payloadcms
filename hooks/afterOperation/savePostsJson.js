import log from '../../helpers/customLog'
import getCol from '../getCol'
import saveToDisk from '../../helpers/_saveToDisk'
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
	const site = args.req.context.site

	const docs = (Array.isArray(result.docs)) ? result.docs : [result] // wrap result in an array because of bulk operations
	const sameSiteDocs = docs.filter(item => item.site === site.id)
	if (sameSiteDocs.length !== docs.length) throw Error(`There are docs with different sites in the same bulk operation!`)
	const postTypes = Array.from(new Set(docs.map((doc) => doc.type))) // get different postTypes

	/* save posts.json in this locale to disk */
	// get all posts
	for (const postType of postTypes) {
		const posts = await getCol(slug, user, {
			depth: 1,
			locale: locale,
			where: {
				and: [
					{ site: { equals: site.id } },
					{ type: { equals: postType } },
				]

			},
		})

		const webVersion = createWebVersion(posts.docs, locale, args.req.user)
		const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${locale}/${postType}.json`
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
				const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${loc}/${postType}.json`
				await saveToDisk(destPath, JSON.stringify(webVersion), user)
			}
		}
	}
}

function createWebVersion(docs = [], locale = '') {

	docs = (docs.docs) ? docs.docs : docs
	docs = (!Array.isArray(docs)) ? [docs] : docs

	let postsWebVersion = []

	for (const doc of docs) {
		let subset = {
			type: doc.type?.id ?? doc.type,
			id: doc.id ?? undefined,
			tags: doc.tags ?? [],
			title: doc.title ?? undefined,
			html: doc.html?.main,
			author: doc.createdByName,
			updatedAt: doc.updatedAt,
			createdAt: doc.createdAt,
			locale: locale,
		}
		if (Array.isArray(doc.shape)) {
			for (const field of doc.shape.filter(item => !['richText'].includes(item))) {
				subset[field] = doc[field]
			}
		}
		postsWebVersion.push(subset)
	}

	return postsWebVersion
}