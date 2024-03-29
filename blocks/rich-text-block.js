import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'
import { imgGalleryBlock } from './img/img-gallery'
import createIncludePostsBlock from './include-posts-block'

const defaultContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

export default function createRichTextBlock() {
	const block = {
		slug: 'rich-text',
		labels: {
			singular: 'RichText Editor',
			plural: 'RichText Editoren'
		},
		fields: [
			// --- [experimental options]
			{
				type: 'collapsible',
				label: {
					en: 'Experimental Options',
					de: 'Experimentelle Optionen'
				},
				admin: {
					initCollapsed: true,
					condition: (data) => (data.editingMode === 'experimental') ? true : false
				},
				fields: [
					// --- mask
					{
						type: 'select',
						name: 'bgMask',
						label: {
							de: 'Maske',
							en: 'Mask'
						},
						admin: {
							width: '25%',
							condition: (data) => (data.editingMode === 'experimental') ? true : false,
						},
						options: [
							{
								value: 'polygon',
								label: {
									de: 'Polygon',
									en: 'Polygon'
								}
							},
						]
					},
					// --- floatImg
					{
						type: 'select',
						name: 'floatImg',
						label: {
							en: 'Image position',
							de: 'Bildposition'
						},
						required: false,
						admin: {
							condition: (data) => (data.editingMode === 'experimental') ? true : false,
							width: '50%',
							description: {
								en: 'Position image in floating text. Changes will become visible on website.',
								de: 'Bildposition im Textfluss. Änderungen werden auf der Website sichtbar.'
							},
						},
						options: [
							{
								label: 'Left',
								value: 'left',
							},
							{
								label: 'Right',
								value: 'right',
							},
							{
								label: 'New line',
								value: 'newline',
							},
						],
					},
				]
			},
			// --- contentRichText
			{
				type: 'richText',
				name: 'contentRichText', // <-- don't change this
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
						/* UploadFeature({
							collections: {
								uploads: {
									// Example showing how to customize the built-in fields
									// of the Upload feature
									fields: [
										{
											name: 'caption',
											type: 'richText',
											editor: lexicalEditor(),
										},
									],
								},
							},
						}), */
						// This is incredibly powerful. You can re-use your Payload blocks
						// directly in the Lexical editor as follows:
						BlocksFeature({
							blocks: [
								imgGalleryBlock,
								createIncludePostsBlock(),
							],
						}),
					]
				}),
				admin: {
					description: {
						en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
						de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
					}
				}
			}
		]
	}

	return block
}