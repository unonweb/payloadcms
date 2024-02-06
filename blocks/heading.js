import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default function createHeadingBlock() {
	const block = {
		slug: 'heading',
		labels: {
			singular: 'Heading',
			plural: 'Überschrift'
		},
		fields: [
			{
				type: 'richText',
				name: 'heading',
				localized: true,
				required: false,
				editor: slateEditor({})
				/* editor: slateEditor({
					admin: {
						elements: ['h3', 'h4', 'h5', 'h6', 'link'],
						leaves: [],
						style: {
							height: 'min-content'
						}
					}
				}), */
			}
		]
	}

	return block
}