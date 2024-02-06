import payload from 'payload'
import log from '../helpers/customLog'
import mailError from '../helpers/mailError'

const otherLocaleField = {
	/*  */
	type: 'radio',
	name: 'otherLocaleField',
	label: {
		de: 'Andere Sprachversionen',
		en: 'Other language versions'
	},
	admin: {
		/* description: {
			de: 'Wie soll',
			en: 'The contents of this language version are copied to all others in order to serve as template'
		}, */
		position: 'sidebar',
		layout: 'vertical',
	},
	options: [
		{
			label: {
				de: 'Bearbeite nur die ausgewählte',
				en: 'Work only on current language'
			},
			value: 'onlyCurrent',
		},
		{
			label: {
				de: 'Kopiere Inhalt zu allen anderen',
				en: 'Copy to other languages'
			},
			value: 'initOthers',
		},
		{
			label: {
				de: 'Speichere auch alle andere neu ab',
				en: 'Save other languages, too'
			},
			value: 'saveOthers',
		},
	],
	defaultValue: 'onlyCurrent',
	hooks: {
		beforeChange: [
			() => 'onlyCurrent' // always reset
		],
		afterChange: [
			// async ({ originalDoc, previousDoc, value, previousValue, context, collection, req, operation })
			async ({ value, context, collection, req, originalDoc, operation }) => {
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

					if (context.preventUpdateOtherLocale === true) return
					if (context.site.locales.used.length === 1) return

					/* init other locales */
					if (value === 'initOthers') {
						for (const loc of context.site.locales.used.filter(loc => loc !== req.locale)) {

							await payload.update({
								collection: collection.slug,
								id: originalDoc.id,
								data: originalDoc, // pass entire doc
								locale: loc,
								context: {
									preventUpdateOtherLocale: true,
									...context,
								}
							})
						}
					}
					/* save other locales */
					if (value === 'saveOthers' && operation === 'update') {
						for (const loc of context.site.locales.used.filter(loc => loc !== req.locale)) {

							await payload.update({
								collection: collection.slug,
								id: originalDoc.id,
								data: { updatedBy: `sites-${Date.now()}` },
								locale: loc,
								context: {
									preventUpdateOtherLocale: true,
									...context,
								}
							})
						}
					}
				} catch (error) {
					log(error.stack, context.user, __filename, 3)
					mailError(error)
				}
			}
		]
	}
}

export default otherLocaleField