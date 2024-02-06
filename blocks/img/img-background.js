
export default function createImgBackgroundBlock({ } = {}) {

	const block = {
		slug: 'img-background',
		labels: {
			singular: {
				en: 'Background Image',
				de: 'Hintergrundbild'
			},
			plural: {
				en: 'Background Images',
				de: 'Hintergrundbilder'
			}
		},
		fields: [
			// --- img.rel
			{
				type: 'upload',
				name: 'rel',
				label: {
					de: 'Hintergrundbild',
					en: 'Background Image'
				},
				relationTo: 'images',
			}
		],
		/* hooks: {
			afterChange: [
				async ({ originalDoc, value, previousValue }) => {
					if (value !== previousValue) {
						
						const img = await getDoc('images', value, context.user, { depth: 0 })
						const newCSS = updateCSSObj(context.site.css, 'body', 'background-image', `url(/assets/imgs/$${img.filename}`)
	
						updateDocSingle('sites', originalDoc.site, context.user, {
							data: {
								css: newCSS
							}
						})	
					}
				}
			]
		} */
	}

	return block
}