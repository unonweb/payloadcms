import log from '../../customLog'
import cpAssets from '../../hooks/_cpAssets'
import getAppMode from '../../hooks/_getAppMode'
import saveToDisk from '../../hooks/_saveToDisk'
import getDoc from '../../hooks/getDoc'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import renderHTMLPage from '../../hooks/renderHTMLPage'
import updateDocSingle from '../../hooks/updateDocSingle'
import mailError from '../../mailError'

export default async function afterChangeHook(col = '', { req, doc, previousDoc, context, operation }) {
	try {
		const user = req?.user?.shortName ?? 'internal'
		log('--- afterChange ---', user, __filename, 7)
		const mode = getAppMode()

		context.site ??= await getRelatedDoc('sites', doc.site, user)
		const site = context.site
		
		if (operation === 'create' && doc.initOtherLocale === true && site.locales.used.length > 1) {
			/* init other locales */
			for (const loc of site.locales.used) {
				if (loc !== req.locale) {
					const updatedDoc = await updateDocSingle(col, doc.id, user, {
						data: doc,
						locale: loc,
					})
				}
			}
		}

		/* cp assets */
		await cpAssets(`${process.cwd()}/upload/images/`, `${site.paths.fs.site}/${mode}/assets/imgs`, doc.assets.imgs, user) // cp imgs from src to dest
		await cpAssets(`${process.cwd()}/upload/documents/`, `${site.paths.fs.site}/${mode}/assets/docs`, doc.assets.docs, user) // cp docs from src to dest

		/* save this as own page */
		if (doc.hasOwnPage) {
			/* compose html */
			const header = (doc.elements.header) ? await getDoc('headers', doc.elements.header, user, { depth: 0, locale: req.locale }) : null
			const nav = (doc.elements.nav) ? await getDoc('navs', doc.elements.nav, user, { depth: 0, locale: req.locale }) : null
			const footer = (doc.elements.footer) ? await getDoc('footers', doc.elements.footer, user, { depth: 0, locale: req.locale }) : null

			const postHTML = renderHTMLPage(req.locale, doc, user, {
				// pass html or undefined:
				navHTML: nav?.html,
				headerHTML: header?.html,
				footerHTML: footer?.html,
			})

			const destPath = `${site.paths.fs.site}/${mode}/${col}/${doc.id}/${req.locale}/index.html` // <-- ATT: hard-coded value
			await saveToDisk(destPath, postHTML, user, { ctParentPath: true })
		}

	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
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