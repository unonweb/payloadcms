export default function createDownloadBlock() {
	
	const block = {
		slug: 'download',
		labels: {
			singular: {
				de: 'Download Block',
				en: 'Download Block'
			},
			plural: {
				de: 'Download Blocks',
				en: 'Download Blocks'
			}
		},
		fields: [
			{
				type: 'text',
				name: 'title'
			},
			// --- file
			{
				type: 'upload',
				name: 'file',
				relationTo: 'images',
				maxDepth: 1, // return entire image 
				required: true,
				admin: {
					description: {
						en: 'File that is offered to download',
						de: 'Datei, die zum Download angeboten wird.'
					}
				},
			},
		],
	}

	return block
}