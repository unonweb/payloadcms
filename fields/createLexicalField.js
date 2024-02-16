import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	HeadingFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'
import { imgGalleryBlock } from '../blocks/img/img-gallery'
import createIncludePostsBlock from '../blocks/include-posts-block'
import createUnImgBlock from '../blocks/img/un-img'
import { mapLeafletBlock } from '../blocks/map-leaflet'
import createSectionBlock from '../blocks/section-block'
import { imgOptions } from './imgOptions'
import createSVGBlock from '../blocks/svg-block'
import createLayoutGridFixed from '../blocks/createLayoutGridFixed'
import createLayoutGridFlex from '../blocks/createLayoutGridFlex'
import createGridColumn from '../blocks/createGridColumn'
import createLayoutFlex from '../blocks/createLayoutFlex'

export default function createLexicalField(blocks = [], { showDescription = true } = {}) {

	// ['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg', 'grid-fixed', 'grid-flex', 'grid-column']
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
	if (blocks.includes('svg')) {
		blocksAvailable.push(createSVGBlock())
	}
	if (blocks.includes('layout-grid-fixed')) {
		blocksAvailable.push(createLayoutGridFixed())
	}
	if (blocks.includes('layout-grid-flex')) {
		blocksAvailable.push(createLayoutGridFlex())
	}
	if (blocks.includes('grid-column')) {
		blocksAvailable.push(createGridColumn())
	}
	if (blocks.includes('layout-flex')) {
		blocksAvailable.push(createLayoutFlex())
	}

	const description = (showDescription) ? 
		{
			en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
			de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
		} : ''

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
					enabledCollections: ['pages'],
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
				HeadingFeature({
					enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5'],
				}),
				UploadFeature({
					collections: {
						images: {
							fields: imgOptions
						},
					},
				}),
				BlocksFeature({
					blocks: [
						...blocksAvailable,
					],
				}),
			]
		}),
		admin: {
			description
		}
	}

	return field
}