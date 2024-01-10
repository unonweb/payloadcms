import createRichTextBlock from '../rich-text-block'
import { mapLeafletBlock } from '../map-leaflet'
import createImgBlock from '../img-block'
import { imgGalleryBlock } from '../img-gallery'
import { imgSlidesBlock } from '../img-slideshow'
import { socialMediaIcons } from '../social-media-icons'
import createTextBlock from '../text-block'
import createTextAreaBlock from '../textarea'

const blocksAvailable = [
	createRichTextBlock(),
	createTextBlock(),
	createTextAreaBlock(),
	createImgBlock(),
	imgGalleryBlock,
	imgSlidesBlock,
	socialMediaIcons,
	mapLeafletBlock,
]

export default function createColumnsFixed() {
	const block = {
		slug: 'columns-fixed',
		labels: {
			singular: {
				en: 'Columns layout (fixed width)',
				de: 'Spalten-Layout (feste Breite)'
			},
			plural: {
				en: 'Columns layouts (fixed width)',
				de: 'Spalten-Layouts (feste Breite)'
			}
		},
		fields: [
			{
				type: 'row',
				admin: {
					condition: (data) => (['additional', 'layout'].includes(data.editingMode)) ? true : false,
					description: {
						en: 'Default settings for all columns',
						de: 'Voreinstellungen für alle Spalten'
					}
				},
				fields: [
					// --- justify
					{
						type: 'select',
						name: 'justify',
						label: {
							en: 'Justify horizontally',
							de: 'Horizontale Ausrichtung'
						},
						defaultValue: 'left',
						required: true,
						admin: {
							width: '50%',
						},
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
					// --- align
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
							width: '50%',
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
				],
			},
			// --- [columns]
			{
				type: 'array',
				name: 'columns',
				label: {
					de: 'Spalten',
					en: 'Columns'
				},
				labels: {
					singular: {
						en: 'Column',
						de: 'Spalte'
					},
					plural: {
						en: 'Columns',
						de: 'Spalten'
					}
				},
				fields: [
					// --- width
					{
						type: 'select',
						name: 'width',
						defaultValue: '100%',
						options: [ /* Option values should be strings that do not contain hyphens or special characters due to GraphQL enumeration naming constraints. Underscores are allowed. If you determine you need your option values to be non-strings or contain special characters, they will be formatted accordingly before being used as a GraphQL enum. */
							{
								label: '1/3',
								value: '33%',
							},
							{
								label: '1/2',
								value: '50%',
							},
							{
								label: '2/3',
								value: '66%',
							},
							{
								label: '100%',
								value: '100%',
							},
						],
					},
					// --- blocks
					{
						type: 'blocks',
						name: 'blocks',
						label: { // heading for blocks fields
							en: ' ',
							de: ' '
						},
						labels: {
							singular: { // shows up as "add ..."
								en: 'Content',
								de: 'Inhalt'
							}, 
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
		]
	}

	return block
}