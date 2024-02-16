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

const SLUG = 'layout-grid-fixed'

export default function createLayoutGridFixed() {
	const block = {
		slug: SLUG,
		labels: {
			singular: {
				en: 'Layout Grid-Fixed',
				de: 'Layout Grid-Fixed'
			},
			plural: {
				en: 'Layouts Grid-Fixed',
				de: 'Layouts Grid-Fixed'
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
					// --- block.layout
					{
						type: 'select',
						name: 'layout',
						label: 'Layout',
						admin: {
							width: '25%',
						},
						defaultValue: '100',
						options: [
							{
								label: {
									en: 'One Column',
									de: 'Eine Spalte'
								},
								value: '100'

							},
							{
								label: '1/2 + 1/2',
								value: '50_50',
							},
							{
								label: '2/3 + 1/3',
								value: '66_33',
							},
							{
								label: '1/3 + 2/3',
								value: '33_66',
							},
							{
								label: '3/4 + 1/4',
								value: '75_25',
							},
							{
								label: '1/4 + 3/4',
								value: '25_75',
							},
							{
								label: '1/3 + 1/3 + 1/3',
								value: '33_33_33',
							},
						]
					},
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
			// --- block.one
			{
				type: 'group',
				name: 'one',
				label: {
					en: '[First Column]',
					de: '[Erste Spalte]'
				},
				admin: {
					hideGutter: true,
				},
				fields: [
				// --- block.one.richText
					createLexicalField(['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg'], { showDescription: false })
				]
			},
			// --- block.two
			{
				type: 'group',
				name: 'two',
				label: {
					de: '[Zweite Spalte]',
					en: '[Second Column]'
				},
				admin: {
					condition: (_, siblingData) => ['50_50', '33_66', '66_33', '75_25', '25_75', '33_33_33'].includes(siblingData.layout),
					hideGutter: true,
				},
				fields: [
					// --- block.two.richText
					createLexicalField(['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg'], { showDescription: false })
				]
			},
			// --- block.three
			{
				type: 'group',
				name: 'three',
				label: {
					de: '[Dritte Spalte]',
					en: '[Third Column]'
				},
				admin: {
					condition: (_, siblingData) => ['33_33_33'].includes(siblingData.layout),
					hideGutter: true,
				},
				fields: [
					// --- block.three.richText
					createLexicalField(['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg'], { showDescription: false })
				]
			}
		]
	}

	return block
}