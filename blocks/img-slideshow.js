export const imgSlidesBlock = {
	slug: 'img-slides',
	labels: {
		singular: {
			en: 'Image Slideshow',
			de: 'Bilder Slideshow'
		},
		plural: {
			en: 'Image Slideshows',
			de: 'Bilder Slideshows'
		}
	},
	fields: [
		// alignment
		//fields.alignment,
		{
			type: 'checkbox',
			name: 'deactivate',
			defaultValue: false,
		},
		{
			type: 'array',
			name: 'images',
			label: 'Slideshow images',
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
					de: 'Präsentation der Bilder wie in einer Diashow (eines nach dem anderen).',
					en: 'Presentation of images like in a slide show (one after the other'
				},
				/* components: {
					RowLabel: ({ index }) => `Image ${index}`
				}, */
			},
			fields: [
				{
					type: 'upload',
					name: 'rel',
					relationTo: 'images',
					label: {
						en: 'Image',
						de: 'Bild'
					},
					required: true,
				},
			],
		},
	]
}