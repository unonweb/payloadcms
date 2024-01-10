const contactDataFields = [
	{
		type: 'text',
		name: 'name',
		label: {
			de: 'Name',
			en: 'Name'
		},
	},
	{
		type: 'row',
		fields: [
			{
				type: 'text',
				name: 'street',
				label: {
					de: 'Straße',
					en: 'Street'
				},
				admin: {
					width: '50%'
				},
			},
			{
				type: 'number',
				name: 'number',
				label: {
					de: 'Nummer',
					en: 'Number'
				},
				admin: {
					width: '50%'
				},
			},
		]
	},
	{
		type: 'row',
		fields: [
			{
				type: 'number',
				name: 'postcode',
				label: {
					de: 'Postleitzahl',
					en: 'Postcode'
				},
				admin: {
					width: '50%'
				},
			},
			{
				type: 'text',
				name: 'place',
				label: {
					de: 'Ort',
					en: 'Place'
				},
				admin: {
					width: '50%'
				},
			},
		]
	},
	{
		type: 'email',
		name: 'email',
		label: {
			de: 'E-Mail',
			en: 'E-Mail'
		},
	},
	{
		type: 'number',
		name: 'phone',
		label: {
			de: 'Telefonnummer',
			en: 'Phone number'
		},
	},

]

export default contactDataFields