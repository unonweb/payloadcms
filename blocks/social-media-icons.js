export const socialMediaIcons = {
	slug: 'social-media-icons',
	labels: {
		singular: 'Social Media Icon',
		plural: 'Social Media Icons'
	},
	fields: [
		{
			type: 'array',
			name: 'socialMediaIcons',
			label: 'Social Media Icons',
			labels: {
				singular: 'Social Media Icon',
				plural: 'Social Media Icons'
			},
			fields: [
				{
					type: 'upload',
					name: 'img',
					relationTo: 'images',
					required: true,
				},
				{
					type: 'text',
					name: 'href',
					label: 'Link to social media site',
					required: true,
				},
			]
		}
	]
}