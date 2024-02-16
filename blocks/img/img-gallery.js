import showOptionsField from '../../fields/showOptions.js'

export const imgGalleryBlock = {
	slug: 'img-gallery',
	labels: {
		singular: {
			en: 'Interactive Image Gallery',
			de: 'Interaktive Bilder Galerie'
		},
		plural: {
			en: 'Interactive Image Galleries',
			de: 'Interaktive Bilder Galerien'
		}
	},
	fields: [
		// --- block.showOptions
		showOptionsField,
		// --- block.number | block.justify | block.modal | block.onclick
		{
			type: 'row',
			admin: {
				condition: (data, siblingData) => {
					if (data) {
						let key = Object.keys(data).find(key => key.startsWith('img-gallery'))
						if (key) {
							return data[key].showOptions
						}
					}
				},
			},
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
					max: 8,
					admin: {
						width: '25%',
						//condition: (data, siblingData) => siblingData.showOptions,
					},
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
						//condition: (data, siblingData) => siblingData.showOptions,
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
				// --- block.onclick
				{
					type: 'select',
					name: 'onclick',
					label: {
						en: 'What happens when an image is clicked?',
						de: 'Was passiert wenn ein Bild anbeklickt wird?'
					},
					admin: {
						width: '50%',
						//condition: (data, siblingData) => siblingData.showOptions,
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
				// --- block.modal
				{
					type: 'select',
					name: 'modal',
					label: {
						en: 'Popup type',
						de: 'Popup Typ'
					},
					admin: {
						width: '25%',
						//condition: (data, siblingData) => siblingData.showOptions,
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
		},
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
				/* description: {
					de: 'Präsentation der Bilder nebeneinander.',
					en: 'Presentation of images side by side.'
				}, */
				initCollapsed: true,
			},
			fields: [
				// --- block.img.rel
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
				// --- block.img.showOptions
				showOptionsField,
				// --- block.img.caption
				{
					type: 'text',
					name: 'caption',
					label: {
						de: 'Untertitel',
						en: 'Caption',
					},
					admin: {
						condition: (data, siblingData) => siblingData.showOptions,
					}
				},
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