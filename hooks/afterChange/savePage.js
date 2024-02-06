import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import saveToDisk from '../../helpers/_saveToDisk'

export default async function savePage({ doc, context, req }) {
	/* 
		afterChange
		collectionHook
	*/
	try {
		const site = context.site
		const user = context.user
		const pathSite = `${context.site.paths.fs.site}/${context.mode}`
		const defLang = site.locales.default

		if (!pathSite) throw new Error('!pathSite')
		
		/* save subpage */
		if (doc.isHome === false) {
			const path = `${pathSite}/${req.locale}/${doc.slug}/index.html`
			await saveToDisk(path, doc.html.page, user) // save current locale page
		}

		/* save homepage */
		if (doc.isHome === true) {
			const path = `${pathSite}/${req.locale}/index.html` // '/home/payload/sites/manueldieterich/en/index.html'
			await saveToDisk(path, doc.html.page, user) // save current localized home
			if (req.locale === defLang) {
				await saveToDisk(`${pathSite}/index.html`, doc.html.page, user) // save additional non-localized home
			}
		}
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
		mailError(error)
	}
}