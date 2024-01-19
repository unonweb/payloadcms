const initOtherLocaleField = {
	type: 'checkbox',
	name: 'initOtherLocale',
	label: {
		de: 'Kopiere zu anderen Sprachen',
		en: 'Copy to other languages'
	},
	admin: {
		description: {
			de: 'Bei der Erstellung werden die Inhalte dieser Sprachversion zu allen anderen kopiert',
			en: 'After creation the contents of this language version are copied to all others'
		},
		position: 'sidebar',
	},
	defaultValue: false,
}

export default initOtherLocaleField