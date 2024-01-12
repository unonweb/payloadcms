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
				de: 'Inhalt'
			},
			value: 'content'
		},
		{
			label: {
				en: 'Functional',
				de: 'Funktional'
			},
			value: 'functional'
		},
		{
			label: {
				en: 'Style',
				de: 'Style'
			},
			value: 'style'
		},
		{
			label: {
				en: 'Layout',
				de: 'Layout'
			},
			value: 'layout'
		},
		{
			label: {
				en: 'Experimental',
				de: 'Experimentell'
			},
			value: 'experimental'
		},
	]
}

export default editingModeField