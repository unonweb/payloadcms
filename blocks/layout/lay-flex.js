import createRichTextBlock from '../rich-text-block.js'
import { mapLeafletBlock } from '../map-leaflet.js'
import createUnImgBlock from '../img/un-img.js'
import { imgGalleryBlock } from '../img/img-gallery.js'
import { imgSlidesBlock } from '../img/img-slideshow.js'
import { socialMediaIcons } from '../social-media-icons.js'
import createIncludePostsFlexBlock from '../include-posts-flex.js'
import showOptionsField from '../../fields/showOptions.js'
import createSVGBlock from '../svg-block.js'

const blocksAvailable = [
	createRichTextBlock(),
	createUnImgBlock(['caption', 'size', 'link', 'shape', 'filter']),
	imgGalleryBlock,
	imgSlidesBlock,
	socialMediaIcons,
	mapLeafletBlock,
	createIncludePostsFlexBlock(),
	createSVGBlock(),
]

export default function createColumnsFlex() {
	const block = {
		slug: 'columns-flex',
		labels: {
			singular: {
				en: 'Layout',
				de: 'Layout'
			},
			plural: {
				en: 'Layouts',
				de: 'Layouts'
			}
		},
		fields: [
			// --- block.showOptions
			showOptionsField,
			{
				type: 'row',
				admin: {
					//condition: (data, siblingData, { user }) => user && user.roles.includes('admin')
				},
				fields: [
					// --- block.layout
					{
						type: 'select',
						name: 'layout',
						label: 'Layout',
						admin: {
							width: '25%',
							description: {
								de: 'Das Spalten-Layout für den Hauptteil der Seite. Es können bis zu 3 Spalten erzeugt werden. Die tatsächliche Darstellung hängt jedoch von der Bildschirmgröße des Endgeräts ab.',
								en: 'The column layout for the main part of the page. Up to 3 columns may be generated. The resulting layout however will be dependend of the screen size.'
							}
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
				]
			},
			{
				type: 'row',
				admin: {
					condition: (data, siblingData) => siblingData.showOptions,
				},
				fields: [
					// --- block.justify
					{
						type: 'select',
						name: 'justify',
						label: {
							en: 'Justify horizontally',
							de: 'Horizontale Ausrichtung'
						},
						required: true,
						admin: {
							width: '25%',
						},
						defaultValue: 'left',
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
							{
								label: 'Space-Around',
								value: 'space-around',
							},
							{
								label: 'Space-Between',
								value: 'space-between',
							},
						],
					},
					// --- block.align
					{
						type: 'select',
						name: 'align',
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
								label: 'Baseline',
								value: 'baseline',
							},
							{
								label: 'End',
								value: 'end',
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
			// --- block.columnOne
			{
				type: 'group',
				name: 'columnOne',
				label: {
					en: 'First Column',
					de: 'Erste Spalte'
				},
				fields: [
					// --- block.columnOne.blocks,
					{
						type: 'blocks',
						name: 'blocks',
						label: { 				// heading for blocks fields
							en: ' ',
							de: ' '
						},
						labels: {
							singular: {
								en: 'Content (in column 1)',
								de: 'Inhalt (in Spalte 1)'
							}, // shows up as "add block"
							plural: {
								en: 'Contents',
								de: 'Inhalte'
							}
						},
						blocks: [
							...blocksAvailable
						],
					}
				]
			},
			// --- block.columnTwo
			{
				type: 'group',
				name: 'columnTwo',
				label: {
					de: 'Zweite Spalte',
					en: 'Second Column'
				},
				admin: {
					condition: (_, siblingData) => ['50_50', '33_66', '66_33', '75_25', '25_75', '33_33_33'].includes(siblingData.layout)
				},
				fields: [
					// --- block.columnTwo.blocks,
					{
						type: 'blocks',
						name: 'blocks',
						label: { 				// heading for blocks fields
							en: ' ',
							de: ' '
						},
						labels: {
							singular: {
								en: 'Content (in column 2)',
								de: 'Inhalt (in Spalte 2)'
							}, // shows up as "add block"
							plural: {
								en: 'Contents',
								de: 'Inhalte'
							}
						},
						blocks: [
							...blocksAvailable
						]
					}
				]
			},
			// --- block.columnThree
			{
				type: 'group',
				name: 'columnThree',
				label: {
					de: 'Dritte Spalte',
					en: 'Third Column'
				},
				admin: {
					condition: (_, siblingData) => ['33_33_33'].includes(siblingData.layout)
				},
				fields: [
					// --- block.columnTwo.blocks,
					{
						type: 'blocks',
						name: 'blocks',
						label: {
							en: ' ',
							de: ' '			// heading for blocks fields
						},
						labels: {
							singular: {
								en: 'Content',
								de: 'Inhalt'
							}, // shows up as "add..."
							plural: {
								en: 'Contents',
								de: 'Inhalte'
							}
						},
						blocks: [
							...blocksAvailable
						]
					}
				]
			}
		]
	}

	return block
}