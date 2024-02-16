import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

import createLexicalField from '../fields/createLexicalField'

const SLUG = 'section'

export default function createSectionBlock() {
	const block = {
		slug: SLUG,
		labels: {
			singular: {
				en: 'Section',
				de: 'Section'
			},
			plural: {
				en: 'Sections',
				de: 'Sections'
			}
		},
		fields: [
			{
				type: 'row',
				fields: [
					// --- block.width
					{
						type: 'select',
						name: 'width',
						admin: {
							width: '25%',
						},
						defaultValue: '100',
						options: [
							{
								label: '1/4',
								value: '25',
							},
							{
								label: '1/3',
								value: '33',
							},
							{
								label: '1/2',
								value: '50',
							},
							{
								label: '2/3',
								value: '66',
							},
							{
								label: '3/4',
								value: '75',
							},
						]
					},
				]
			},
			createLexicalField()
		]
	}

	return block
}