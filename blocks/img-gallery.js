//import createImgBlock from './img'
import createLinkImgField from '../fields/link-img-field'
import imgStyleOptions from '../fields/img-style-fields'

export const imgGalleryBlock = {
	slug: 'img-gallery',
	labels: {
		singular: {
			en: 'Image Gallery',
			de: 'Bilder Galerie'
		},
		plural: {
			en: 'Image Galleries',
			de: 'Bilder Galerien'
		}
	},
	fields: [
		// [functional options]
		{
			type: 'collapsible',
			label: {
				de: 'Funktionale Optionen',
				en: 'Functional Options'
			},
			admin: {
				initCollapsed: true,
				condition: (data) => (data.editingMode === 'functional') ? true : false,
			},
			fields: [
				{
					type: 'row',
					fields: [
						// --- onclick
						{
							type: 'select',
							name: 'onclick',
							label: {
								en: 'What happens when an image is clicked?',
								de: 'Was passiert wenn ein Bild anbeklickt wird?'
							},
							admin: {
								width: '25%',
							},
							options: [
								{
									label: {
										de: 'Öffne Popup',
										en: 'Open Popup'
									},
									value: 'modal',
								},
							],
						},
						// --- onclick
						{
							type: 'select',
							name: 'modal',
							label: {
								en: 'Popup type',
								de: 'Popup Typ'
							},
							defaultValue: 'lightbox',
							admin: {
								width: '25%',
							},
							options: [
								{
									label: {
										de: 'lightbox',
										en: 'lightbox'
									},
									value: 'lightbox',
								},
							],
						},
					]
				}
			]
		},
		// [layout options]
		{
			type: 'collapsible',
			label: {
				de: 'Layout Optionen',
				en: 'Layout Options'
			},
			admin: {
				initCollapsed: true,
				condition: (data) => (data.editingMode === 'layout') ? true : false,
			},
			fields: [
				{
					type: 'row',
					fields: [
						// --- block.number
						{
							type: 'number',
							name: 'number',
							label: {
								en: 'Number of images in a row',
								de: 'Anzahl der Bilder in einer Reihe'
							},
							defaultValue: 4,
							min: 1,
							max: 8
						},
						// --- block.justify
						{
							type: 'select',
							name: 'justify',
							label: {
								en: 'Justify horizontally',
								de: 'Horizontale Ausrichtung'
							},
							defaultValue: 'left',
							admin: {
								width: '25%',
							},
							options: [
								{
									label: 'Left',
									value: 'left',
								},
								{
									label: 'Center',
									value: 'center',
								},
								{
									label: 'Right',
									value: 'right',
								},
								{
									label: 'Space-Around',
									value: 'space-around',
								},
								{
									label: 'Space-Between',
									value: 'space-between',
								},
							],
						},
					]
				},
			]
		},
		// [style options]
		{
			type: 'collapsible',
			label: {
				de: 'Style Optionen',
				en: 'Style Options'
			},
			admin: {
				initCollapsed: true,
				condition: (data) => (data.editingMode === 'style') ? true : false,
			},
			fields: [
				{
					type: 'row',
					fields: [
						...imgStyleOptions,
					]
				}
			]
		},
		// --- images
		{
			type: 'array',
			name: 'images',
			label: {
				de: 'Bilder',
				en: 'Images'
			},
			labels: {
				singular: {
					en: 'Image',
					de: 'Bild'
				},
				plural: {
					en: 'Images',
					de: 'Bilder'
				}
			},
			admin: {
				description: {
					de: 'Präsentation der Bilder nebeneinander.',
					en: 'Presentation of images side by side.'
				},
				initCollapsed: true,
			},
			fields: [
				// --- rel
				{
					type: 'upload',
					name: 'rel',
					relationTo: 'images',
					label: {
						en: 'Image',
						de: 'Bild'
					},
					required: true,
					localized: false,
				},
				// --- link
				createLinkImgField()
			],
		}
		/* {
			type: 'array',
			name: 'images',
			label: 'Gallery images',
			labels: {
				singular: {
					en: 'Image',
					de: 'Bild'
				},
				plural: {
					en: 'Images',
					de: 'Bilder'
				}
			},
			admin: {
				description: {
					de: 'Präsentation der Bilder nebeneinander.',
					en: 'Presentation of images side by side.'
				},
			},
			// --- upload array start
			fields: [
				{
					type: 'upload',
					name: 'img',
					label: {
						en: 'Image',
						de: 'Bild'
					},
					relationTo: 'images',
					required: true,
				},
				
			],
		}, */
	]
}