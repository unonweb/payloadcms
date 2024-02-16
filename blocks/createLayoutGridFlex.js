import createRichTextBlock from './rich-text-block.js'
import { mapLeafletBlock } from './map-leaflet.js'
import createUnImgBlock from './img/un-img.js'
import { imgGalleryBlock } from './img/img-gallery.js'
import { imgSlidesBlock } from './img/img-slideshow.js'
import { socialMediaIcons } from './social-media-icons.js'
import createIncludePostsBlock from './include-posts-block.js'
import showOptionsField from '../fields/showOptions.js'
import createSVGBlock from './svg-block.js'
import createLexicalField from '../fields/createLexicalField.js'

const blocksAvailable = [
	createRichTextBlock(),
	createUnImgBlock(['caption', 'size', 'link', 'shape', 'filter']),
	imgGalleryBlock,
	imgSlidesBlock,
	socialMediaIcons,
	mapLeafletBlock,
	createIncludePostsBlock(),
	createSVGBlock(),
]

const SLUG = 'layout-grid-flex'

export default function createLayoutGridFlex() {
	const block = {
		slug: SLUG,
		labels: {
			singular: {
				en: 'Layout Grid-Flex',
				de: 'Layout Grid-Flex'
			},
			plural: {
				en: 'Layouts Grid-Flex',
				de: 'Layouts Grid-Flex'
			}
		},
		fields: [
			// --- block.showOptions
			//showOptionsField,
			{
				type: 'row',
				admin: {
					description: {
						de: 'Das Spalten-Layout für den Hauptteil der Seite. Es können bis zu 3 Spalten erzeugt werden. Die tatsächliche Darstellung hängt jedoch von der Bildschirmgröße des Endgeräts ab.',
						en: 'The column layout for the main part of the page. Up to 3 columns may be generated. The resulting layout however will be dependend of the screen size.'
					}
				},
				fields: [
					// --- block.justifyItems
					{
						type: 'select',
						name: 'justifyItems',
						label: {
							en: 'Justify horizontally',
							de: 'Horizontale Ausrichtung'
						},
						required: false,
						admin: {
							width: '25%',
						},
						defaultValue: 'center',
						options: [
							{
								label: 'Left',
								value: 'left',
							},
							{
								label: 'Center',
								value: 'center',
							},
							{
								label: 'Right',
								value: 'right',
							},
						],
					},
					// --- block.alignItems
					{
						type: 'select',
						name: 'alignItems',
						label: {
							en: 'Align vertically',
							de: 'Vertikale Ausrichtung'
						},
						defaultValue: 'start',
						required: true,
						admin: {
							width: '25%',
						},
						options: [
							{
								label: 'Start',
								value: 'start',
							},
							{
								label: 'Center',
								value: 'center',
							},
							{
								label: 'End',
								value: 'end',
							},
							{
								label: 'Baseline',
								value: 'baseline',
							},
						],
					},
					// --- block.gap
					{
						type: 'number',
						name: 'gap',
						label: {
							en: 'Gap',
							de: 'Abstand'
						},
						defaultValue: 5,
						required: true,
						admin: {
							width: '25%',
							description: {
								en: '... between the content blocks (in % of the available space)',
								de: '... zwischen den Inhaltsblöcken (in % des verfügbaren Raums)'
							},
							hidden: true,
						},
						min: 2,
						max: 15,
					},
				]
			},
			// --- block.columns
			{
				type: 'array',
				name: 'columns',
				label: {
					en: 'Columns',
					de: 'Spalten'
				},
				fields: [
					{ 
						type: 'row',
						fields: [
							{
								type: 'number',
								name: 'width',
								label: {
									en: 'Width',
									de: 'Breite'
								},
								admin: {
									width: '50%',
									description: {
										de: '',
										en: '',
									}
								}
							},
							{
								type: 'select',
								name: 'unit',
								label: {
									en: 'Unit',
									de: 'Einheit'
								},
								options: ['px', 'fr', '%']
							},
						]
					},
					// --- block.columns.richText
					createLexicalField(['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg'], { showDescription: false })
				]
			},
		]
	}

	return block
}