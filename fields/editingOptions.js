const editingOptionsField = {
	type: 'select',
	name: 'editingOptions',
	label: {
		de: 'Optionen',
		en: 'Options'
	},
	defaultValue: [],
	admin: {
		position: 'sidebar',
		layout: 'vertical',
	},
	options: [
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

export default editingOptionsField