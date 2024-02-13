import createRichTextBlock from '../rich-text-block.js'
import { mapLeafletBlock } from '../map-leaflet.js'
import createUnImgBlock from '../img/un-img.js'
import { imgGalleryBlock } from '../img/img-gallery.js'
import { imgSlidesBlock } from '../img/img-slideshow.js'
import { socialMediaIcons } from '../social-media-icons.js'
import createIncludePostsBlock from '../include-posts-block.js'
import showOptionsField from '../../fields/showOptions.js'
import createSVGBlock from '../svg-block.js'

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

const SLUG = 'group'
export default function createGroupBlock() {
	const block = {
		slug: SLUG,
		labels: {
			singular: {
				en: 'Group',
				de: 'Gruppe'
			},
			plural: {
				en: 'Groups',
				de: 'Gruppen'
			}
		},
		fields: [
			
			{
				type: 'row',
				admin: {
					//condition: (data, siblingData, { user }) => user && user.roles.includes('admin')
				},
				fields: [
					// --- block.layout
					{
						type: 'select',
						name: 'width',
						admin: {
							width: '25%',
						},
						defaultValue: '100',
						options: [
							{
								label: '1/3',
								value: '33',
							},
							{
								label: '1/2',
								value: '50',
							},
							{
								label: '1/4',
								value: '25',
							},
						]
					},
				]
			},
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
			},
			{
				type: 'row',
				admin: {
					condition: (data, siblingData) => false
				},
				fields: [
					// --- block.justify
					/* {
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
					}, */
					// --- block.align
					/* {
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
					}, */
				]
			},
		]
	}

	return block
}