import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import getDoc from '../getDoc'
import renderPageHTML from '../../helpers/renderPageHTML'

export default async function setHTML({ data, req, operation, originalDoc, context }) {
	/*
		Type:
			beforeChange collection
		Called by:
			- Pages
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
		const docID = originalDoc?.id ?? null

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
			data.html.page = renderPageHTML(data, req.locale, docID, context, {
				// pass html or undefined:
				navHTML: context.nav?.html?.main,
				headerHTML: context.header?.html?.main,
				footerHTML: context.footer?.html?.main,
			})
		}

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error)
	}
}