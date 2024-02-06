import showOptionsField from '../../fields/showOptions.js'

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
		// --- block.showOptions
		showOptionsField,
		{
			type: 'row',
			admin: {
				condition: (data, siblingData) => siblingData.showOptions,
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
		{
			type: 'row',
			admin: {
				condition: (data, siblingData) => siblingData.showOptions,
			},
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
		},
		// --- block.images
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
				// --- img.caption
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
				// --- block.img.link
				{
					type: 'group',
					name: 'link',
					label: ' ',
					admin: {
						hideGutter: true,
						className: 'hide-group-label',
						condition: (data, siblingData) => siblingData.showOptions,
					},
					fields: [
						// --- block.img.link.type
						{
							type: 'radio',
							name: 'type',
							label: {
								de: 'Typ',
								en: 'Type'
							},
							options: [
								{
									label: {
										de: 'Kein Link',
										en: 'No Link'
									},
									value: 'none',
								},
								{
									label: {
										de: 'Interner Link',
										en: 'Internal Link'
									},
									value: 'internal',
								},
								{
									label: {
										en: 'Custom URL',
										de: 'URL Eingabe'
									},
									value: 'custom',
								},
							],
							defaultValue: 'none',
							admin: {
								layout: 'horizontal',
							},
						},
						// --- row
						{
							type: 'row',
							fields: [
								// ---  block.img.link.slug
								{
									type: 'relationship',
									name: 'rel',
									label: {
										de: 'Verlinktes Dokument',
										en: 'Linked Document'
									},
									relationTo: ['pages', 'posts-flex'],
									required: true,
									maxDepth: 2,
									admin: {
										width: '50%',
										condition: (data, siblingData) => siblingData?.type === 'internal',
									},
								},
								// ---  block.img.link.url
								{
									type: 'text',
									name: 'url',
									label: 'Custom URL',
									required: true,
									admin: {
										condition: (data, siblingData) => siblingData?.type === 'custom',
									},
								},
							],
						}
					]
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