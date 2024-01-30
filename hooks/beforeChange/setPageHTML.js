import log from '../../customLog'
import mailError from '../../mailError'
import getDoc from '../getDoc'
import renderPageHTML from '../../helpers/renderPageHTML'

export default async function setPageHTML({ data, req, operation, context }) {
	/*
		Called by:
			- Post
			- PostsFlex
		Requires:
			- page.html.head
			- page.html.main
		Tasks:
			- Get page element data
			- renderPageHTML()
	*/
	try {
		const user = req.context.user

		/* save this as own page */
		if (data.hasOwnPage === undefined || data.hasOwnPage === true) {

			if (data.header) {
				context.header = (data.header === context.header?.id) ? context.header : await getDoc('headers', data.header, user, { depth: 0, locale: req.locale })	
			}
			if (data.nav) {
				context.nav = (data.nav === context.nav?.id) ? context.nav : await getDoc('navs', data.nav, user, { depth: 0, locale: req.locale })
			}
			if (data.footer) {
				context.footer = (data.footer === context.footer?.id) ?  context.footer : await getDoc('footers', data.footer, user, { depth: 0, locale: req.locale })
			}
			
			/* compose html */
			data.html.page = renderPageHTML(req.locale, data, user, {
				// pass html or undefined:
				navHTML: context.nav?.html?.main,
				headerHTML: context.header?.html?.main,
				footerHTML: context.footer?.html?.main,
			})
		}

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error, req)
	}
}