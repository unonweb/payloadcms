import createLinkIntBlock from './link-int-block.js'
import createLinkExtBlock from './link-ext-block.js'
import createUnImgBlock from './img/un-img.js'

export default function createMenuDropDown() {
	const block = {
		slug: 'menu-drop-down',
		labels: {
			singular: {
				de: 'Sub-Menü',
				en: 'Sub-Menu',
			},
			plural: {
				de: 'Sub-Menüs',
				en: 'Sub-Menus',
			}
		},
		fields: [
			{
				type: 'text',
				name: 'title',
				required: true,
			},
			// --- overlay
			{
				type: 'checkbox',
				name: 'overlay',
			},
			// --- openOn
			{
				type: 'radio',
				name: 'openOn',
				options: [
					{
						label: 'Hover',
						value: 'hover',
					},
					{
						label: 'Click',
						value: 'click',
					},
				],
				defaultValue: 'click',
				admin: {
					layout: 'horizontal',
				},
			},
			// --- block
			{
				type: 'blocks',
				name: 'blocks',
				label: {
					en: 'Sub-Menu Item',
					de: 'Sub-Menüpunkt'
				},
				minRows: 1,
				labels: {
					singular: {
						en: 'Sub-Menu item',
						de: 'Sub-Menüpunkt'
					},
					plural: {
						en: 'Sub-Menu items',
						de: 'Sub-Menüpunkte'
					},
				},
				defaultValue: [
					{
						blockType: 'menu-link'
					}
				],
				blocks: [
					createLinkIntBlock({ slots: 'link' }),
					createLinkExtBlock({ slots: 'link' }),
					createUnImgBlock(['caption', 'size', 'link']),
				]
			},
		]
	}

	return block
}