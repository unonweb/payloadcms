const showOptionsField = {
	type: 'checkbox',
	name: 'showOptions',
	label: 'Optionen',
	defaultValue: false,
	hooks: {
		beforeChange: [
			() => false // always reset
		]
	}
}

export default showOptionsField