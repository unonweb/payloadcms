export const dateFlex = {
	slug: 'date-flex',
	labels: {
		singular: {
			en: 'Flexible date input',
			de: 'Flexible Datumseingabe'
		},
	},
	fields: [
		{
			type: 'row',
			fields: [
				{
					type: 'number',
					name: 'day', // <-- IMPROVE: insert validate function
					label: {
						de: 'Tag',
						en: 'Day'
					},
					admin: {
						width: '33%'
					}
				},
				{
					type: 'select',
					name: 'month',
					label: {
						de: 'Monat',
						en: 'Month'
					},
					options: [
						{
							value: '01',
							label: {
								de: 'Januar',
								en: 'January'
							}
						},
						{
							value: '02',
							label: {
								de: 'Februar',
								en: 'February'
							}
						},
						{
							value: '03',
							label: {
								de: 'März',
								en: 'March'
							}
						},
						{
							value: '04',
							label: {
								de: 'April',
								en: 'April'
							}
						},
						{
							value: '05',
							label: {
								de: 'Mai',
								en: 'May'
							}
						},
						{
							value: '06',
							label: {
								de: 'Juni',
								en: 'June'
							}
						},
						{
							value: '07',
							label: {
								de: 'Juli',
								en: 'July'
							}
						},
						{
							value: '08',
							label: {
								de: 'August',
								en: 'August'
							}
						},
						{
							value: '09',
							label: {
								de: 'September',
								en: 'September'
							}
						},
						{
							value: '10',
							label: {
								de: 'Oktober',
								en: 'October'
							}
						},
						{
							value: '11',
							label: {
								de: 'November',
								en: 'November'
							}
						},
						{
							value: '12',
							label: {
								de: 'Dezember',
								en: 'December'
							}
						},
					],
					admin: {
						width: '33%'
					}
				},
				{
					type: 'number',
					name: 'year', // <-- IMPROVE: insert validate function
					label: {
						de: 'Jahr',
						en: 'Year'
					},
					admin: {
						width: '33%'
					}
				},
			]
		}
	]
}