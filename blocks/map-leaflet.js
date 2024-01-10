export const mapLeafletBlock = {
	slug: 'map-leaflet',
	labels: {
		singular: {
			en: 'Map (Leaflet)',
			de: 'Karte (Leaflet)'
		},
		plural: {
			en: 'Maps (Leaflet)',
			de: 'Karten (Leaflet)'
		}
	},
	fields: [
		// --- leaflet.coords
		{
			type: 'point',
			name: 'coords',
			label: {
				de: 'Koordinaten',
				en: 'Coordinates'
			},
		},
		/* {
			type: 'row',
			fields: [
				// --- leaflet.lat
				{
					type: 'number',
					name: 'lat',
					label: {
						en: 'Latitude',
						de: 'Längengrad'
					},
					required: true,
					defaultValue: 48,
					admin: {
						width: '50%',
					},
				},
				// --- leaflet.lon
				{
					type: 'number',
					name: 'lon',
					label: {
						en: 'Longitude',
						de: 'Breitengrad'
					},
					required: true,
					defaultValue: 9,
					admin: {
						width: '50%',
					},
				},
			]
		}, */
		// --- leaflet.pin
		{
			type: 'select',
			name: 'pin',
			label: {
				en: 'Add a pin to the map',
				de: 'Pin hinzufügen'
			},
			admin: {
				isClearable: true
			},
			options: [
				{
					value: 'div',
					label: {
						de: 'Popup',
						en: 'Popup'
					}
				}
			]
		},
		// --- leaflet.pintext
		{
			type: 'text',
			name: 'pintext',
			label: {
				en: 'Popup-Text',
				de: 'Popup-Text'
			},
			admin: {
				condition: (_, siblingData) => siblingData?.pin,
			},
		}
	],
}