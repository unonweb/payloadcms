import payload from 'payload'
import log from '../../helpers/customLog'

export default async function updateOtherLocale({ req, doc, previousDoc, context, operation}) {
		/*
			Type:
				afterChange collection hook
			Task: 
				Update all other locales of this document with this document's data
		*/
		try {

			if (context.preventUpdateOtherLocale === true) return
			if (context.site.locales.used.length === 1) return

			/* init other locales */
			for (const loc of context.site.locales.used.filter(loc => loc !== req.locale)) {

				await payload.update({
					collection: req.collection.config.slug,
					id: doc.id,
					data: doc, // pass entire doc
					locale: loc,
					context: {
						preventUpdateOtherLocale: true,
						...context,
					}
				})
			}
		} catch (error) {
			log(error.stack, context.user, __filename, 3)
		}
}