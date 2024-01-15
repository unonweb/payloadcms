import log from '../../customLog'
import getAppMode from '../../hooks/_getAppMode'
import getCol from '../../hooks/_getCol'
import saveToDisk from '../../hooks/_saveToDisk'
import getRelatedDoc from '../../hooks/getRelatedDoc'

export default async function afterOperationHook(col = '', { args, operation, result }) {
	/* in bulk operation result contains result.docs and result.errors */

	if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
		const user = args?.req?.user?.shortName ?? 'internal'
		const mode = getAppMode()

		const docs = (Array.isArray(result.docs)) ? result.docs : [result] // wrap result in an array; necessary because of bulk operations

		for (const doc of docs) { 
			// <-- IMP: Now when deleting multiple posts for each post this code is executed; basically only for different sites this code would need to be executed
			args.req.context.site ??= await getRelatedDoc('sites', doc.site, user)
			const site = args.req.context.site

			/* save all contents to disk */
			for (const loc of site.locales.used) {

				const res = await getCol(col, user, {
					depth: 1,
					locale: loc,
					where: {
						site: { equals: site.id }
					},
				})

				const webVersion = createWebVersion(col, res.docs, args.req.user)
				const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${loc}/${col}.json`
				await saveToDisk(destPath, JSON.stringify(webVersion), user)
			}
		}

		console.timeEnd(`<7>[time] [${col}] "${args.req.context.timeID}"`)
	}
}

function createWebVersion(slug = '', docs = [], user = {}) {

	docs = (docs.docs) ? docs.docs : docs
	docs = (!Array.isArray(docs)) ? [docs] : docs

	let webVersion

	if (slug === 'events') {
		webVersion = docs.map(doc => {
			return {
				id: doc.id,
				tags: doc.tags,
				title: doc.title,
				time: doc.time,
				html: doc.html,
				author: `${user.firstName} ${user.lastName}`,
				date: doc.date,
				updatedAt: doc.updatedAt,
				createdAt: doc.createdAt,
			}
		})
	}

	if (slug === 'posts') {
		webVersion = docs.map(doc => {
			return {
				id: doc.id,
				tags: doc.tags,
				title: doc.title,
				time: doc.time,
				html: doc.html.main,
				author: `${user.firstName} ${user.lastName}`,
				date: doc.date,
				updatedAt: doc.updatedAt,
				createdAt: doc.createdAt,
			}
		})
	}

	return webVersion
}