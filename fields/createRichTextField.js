import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'
import { imgGalleryBlock } from '../blocks/img/img-gallery'
import createIncludePostsBlock from '../blocks/include-posts-block'
import createUnImgBlock from '../blocks/img/un-img'
import { mapLeafletBlock } from '../blocks/map-leaflet'
import createSectionBlock from '../blocks/section-block'
import { uploadFeatureImgFields } from './uploadFeatureImgFields'

export default function createRichTextField(blocks = []) {

	// ['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'un-img']
	const blocksAvailable = []

	if (blocks.includes('img-gallery')) {
		blocksAvailable.push(imgGalleryBlock,)
	}
	if (blocks.includes('map-leaflet')) {
		blocksAvailable.push(mapLeafletBlock)
	}
	if (blocks.includes('section')) {
		blocksAvailable.push(createSectionBlock())
	}
	if (blocks.includes('include-posts-flex')) {
		blocksAvailable.push(createIncludePostsBlock())
	}
	if (blocks.includes('un-img')) {
		blocksAvailable.push(createUnImgBlock(['caption', 'size', 'link', 'shape', 'filter']))
	}

	const field = {
		type: 'richText',
		name: 'richText',
		label: ' ',
		localized: true,
		required: false,
		editor: lexicalEditor({
			features: ({ defaultFeatures }) => [
				...defaultFeatures,
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
						images: {
							fields: uploadFeatureImgFields
						},
					},
				}),
				BlocksFeature({
					blocks: [
						...blocksAvailable
					],
				}),
			]
		}),
		admin: {
			description: {
				en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
				de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
			},
			condition: (data, siblingData) => data?.layout === 'richText',
		}
	}

	return field
}