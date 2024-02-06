import payload from 'payload'
import log from '../helpers/customLog'
import mailError from '../helpers/mailError'

const initOtherLocaleField = {
	type: 'checkbox',
	name: 'initOtherLocale',
	label: {
		de: 'Kopiere Inhalt zu anderen Sprachen',
		en: 'Copy contentto other languages'
	},
	admin: {
		description: {
			de: 'Die Inhalte dieser Sprachversion werden als Vorlage zu allen anderen kopiert',
			en: 'The contents of this language version are copied to all others in order to serve as template'
		},
		position: 'sidebar',
	},
	defaultValue: false,
	hooks: {
		beforeChange: [
			() => false // always reset to false
		],
		afterChange: [
			// async ({ originalDoc, previousDoc, value, previousValue, context, collection, req, operation })
			async ({ value, context, collection, req, originalDoc }) => {
				/*
					Type:
						afterChange
						fieldHook
					Task: 
						Update all other locales of this document with this document's data
					Attention:
						The field value is always reset to false
						But still 'value' holds the original value given in the admin panel
				*/
				try {
					if (value === true && context.site.locales.used.length > 1) {
						/* init other locales */
						for (const loc of context.site.locales.used.filter(loc => loc !== req.locale)) {

							await payload.update({
								collection: collection.slug,
								id: originalDoc.id,
								data: originalDoc,
								locale: loc,
								context: context,
							})
						}
					}
				} catch (error) {
					log(error.stack, context.user, __filename, 3)
					mailError(error, req)
				}
			}
		]
	}
}

export default initOtherLocaleField