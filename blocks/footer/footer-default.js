import createContactDataBlock from '../contact-data-block';

const footerDefault = {
	slug: 'footer-default',
	labels: {
		singular: {
			en: 'Default Footer',
			de: 'Standard-Footer',
		},
		plural: {
			en: 'Default Footer',
			de: 'Standard-Footer',
		}
	},
	fields: [
		{
			type: 'blocks',
			name: 'blocks',
			blocks: [
				createContactDataBlock()
			],
		},
	]
}

export default footerDefault