const editingModeField = {
	type: 'radio',
	name: 'editingMode',
	label: {
		de: 'Bearbeitungsmodus',
		en: 'Editing Mode'
	},
	defaultValue: 'content',
	admin: {
		position: 'sidebar',
		layout: 'vertical',
	},
	options: [
		{
			label: {
				en: 'Content Focus',
				de: 'Fokus: Inhalt'
			},
			value: 'content'
		},
		{
			label: {
				en: 'Functional Options',
				de: 'Funktionelle Optionen'
			},
			value: 'functional'
		},
		{
			label: {
				en: 'Style Options',
				de: 'Style Optionen'
			},
			value: 'style'
		},
		{
			label: {
				en: 'Layout Options',
				de: 'Layout Optionen'
			},
			value: 'layout'
		},
		{
			label: {
				en: 'Experimental Options',
				de: 'Experimentelle Optionen'
			},
			value: 'experimental'
		},
	]
}

export default editingModeField