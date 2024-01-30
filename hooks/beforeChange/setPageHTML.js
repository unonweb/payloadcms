import log from '../../customLog'
import mailError from '../../mailError'
import getDoc from '../getDoc'
import renderPageHTML from '../../helpers/renderPageHTML'

export default async function setPageHTML({ data, req, operation }) {
	/*
		Called by:
			- Post
			- PostsFlex
		Requires:
			- page.html.head
			- page.html.main
	*/
	try {
		const user = req.context.user

		/* save this as own page */
		if (data.hasOwnPage) {
			/* compose html */
			const header = (data.header) ? await getDoc('headers', data.header, user, { depth: 0, locale: req.locale }) : null
			const nav = (data.nav) ? await getDoc('navs', data.nav, user, { depth: 0, locale: req.locale }) : null
			const footer = (data.footer) ? await getDoc('footers', data.footer, user, { depth: 0, locale: req.locale }) : null

			data.html.page = renderPageHTML(req.locale, data, user, {
				// pass html or undefined:
				navHTML: nav?.html,
				headerHTML: header?.html,
				footerHTML: footer?.html,
			})
		}

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error, req)
	}
}