import { widthField } from '../fields/width-field';

export const mapLeafletBlock = {
	slug: 'map-leaflet',
	labels: {
		singular: {
			en: 'Map',
			de: 'Karte'
		},
		plural: {
			en: 'Maps',
			de: 'Karten'
		}
	},
	fields: [
		// leaflet.width
		//widthField,
		// --- leaflet.coords
		{
			type: 'point',
			name: 'coords',
			label: {
				de: 'Koordinaten',
				en: 'Coordinates'
			},
		},
		{
			type: 'row',
			fields: [
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
			]
		},
	],
}