import log from '../../helpers/customLog'

export default async function initPayload({ req, doc, operation, previousDoc, context }) {
	/*
		State:
			Not used currently
		Task:
			Init payload with comfortable defaults
	*/
	try {
		if (operation === 'create') {
			/* INIT PAYLOAD */
			// needs to be run in afterChange hook because before this site has no id yet

			// disabled currently !!!
			const header = await createDoc('headers', user, {
				locale: doc.locales.default,
				data: {
					site: doc.id,
				}
			})
			const nav = await createDoc('navs', user, {
				locale: doc.locales.default,
				data: {
					site: doc.id,
				}
			})
			const footer = await createDoc('footers', user, {
				locale: doc.locales.default,
				data: {
					site: doc.id,
				}
			})
			/* const page = await createDoc('pages', user, {
				locale: doc.locales.default,
				data: {
					site: doc.id,
					title: doc.domainShort,
					isHome: true,
					header: header.id,
					nav: nav.id,
					footer: footer.id
				}
			}) */
		}
	} catch (error) {
		log(err.stack, user, __filename, 3)
	}
}