import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

import createRichTextField from '../fields/createRichTextField'
import { uploadFeatureImgFields } from '../fields/uploadFeatureImgFields'

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
			{
				type: 'richText',
				name: 'richText',
				label: ' ',
				localized: true,
				required: false,
				editor: lexicalEditor({
					features: ({ defaultFeatures }) => [
						...defaultFeatures,
						// The HTMLConverter Feature is the feature which manages the HTML serializers. If you do not pass any arguments to it, it will use the default serializers.
						// HTMLConverterFeature({}),
						LinkFeature({
							fields: [
								{
									type: 'checkbox',
									name: 'isDownload',
									label: {
										en: 'Download-Link',
										de: 'Download-Link'
									},
									defaultValue: false,
								},
								/* {
									type: 'relationship',
									relationTo: ['posts-flex'],
									name: 'rel',
									label: 'Internal link to dynamic content',
								}, */
							],
						}),
						UploadFeature({
							collections: {
								images: { // add fields for images referenced by UploadFeature
									fields: uploadFeatureImgFields,
								},
							},
						}),
					]
				}),
				admin: {
					description: {
						en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
						de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
					},
				}
			}
		]
	}

	return block
}