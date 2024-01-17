const initOtherLocaleField = {
	type: 'checkbox',
	name: 'initOtherLocale',
	label: {
		de: 'Kopiere zu anderen Sprachen',
		en: 'Copy to other languages'
	},
	admin: {
		description: {
			de: 'Die Inhalte der ersten Sprachversion einer Seite werden auf alle anderen kopiert (und können dann angepasst/übersetzt werden).',
			en: 'The contents of the first language version of a posts are copied to the other languages in order to serve as a starting point for translations.'
		},
		position: 'sidebar',
	},
	defaultValue: false,
}

export default initOtherLocaleField