export const datePicker = {
	slug: 'date-picker',
	labels: {
		singular: 'A Date Picker',
		plural: 'Date Pickers'
	},
	fields: [
		{
			type: 'date',
			name: 'date',
			label: {
				de: 'Datum',
				en: 'Date'
			},
			defaultValue: () => (new Date()),
			admin: {
				date: {
					pickerAppearance: 'dayOnly',
					displayFormat: 'yyyy-MM-d'
				},
				description: {
					de: 'Wenn nicht das exakte Datum, sondern z.B. nur Monat & Jahr angegeben werden sollen, bitte das Tool zur flexiblen Datumseingabe verwenden.'
				}
			} 
		},
	]
}