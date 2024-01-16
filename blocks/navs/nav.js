import createLangSwitchBlock from '../lang-switch';
import createLinkExtBlock from '../link-ext-block';
import createLinkIntBlock from '../link-int-block';
import createMenuDropDown from '../menu-drop-down';

const nav = {
	slug: 'nav',
	labels: {
		singular: 'Navigation',
		plural: 'Navigations'
	},
	// --- fields
	fields: [
		{
			type: 'row',
			fields: [
				{
					type: 'checkbox',
					name: 'enableSplit',
					defaultValue: false,
					admin: {
						width: '25%'
					}
				},
				{
					type: 'select',
					name: 'isDropDown',
					defaultValue: 'false',
					admin: {
						width: '25%'
					},
					options: ['breakpoint', 'false', 'true']
				},
			]
		},
		// --- blocks
		{
			type: 'blocks',
			name: 'blocks',
			label: {
				de: 'Menüpunkte',
				en: 'Menu items'
			},
			labels: {
				singular: {
					de: 'Menüpunkt',
					en: 'Menu item'
				},
				plural: {
					de: 'Menüpunkte',
					en: 'Menu items'
				},
			},
			blocks: [
				createLinkIntBlock({ slots: ['offset'] }),
				createLinkExtBlock(),
				createLangSwitchBlock(),
				createMenuDropDown()
			]
		},
		// --- block.offset
		{
			type: 'blocks',
			name: 'offset',
			label: {
				de: 'Offset Slot',
				en: 'Offset Slot'
			},
			labels: {
				singular: {
					de: 'Menüpunkt',
					en: 'Menu item'
				},
				plural: {
					de: 'Menüpunkte',
					en: 'Menu items'
				},
			},
			minRows: 0,
			maxRows: 3,
			admin: {
				condition: (data, siblingData) => (siblingData.enableSplit === true) ? true : false,
				description: {
					de: 'Die Menüpunkte in diesem Slot werden von den anderen im Layout abgesetzt.',
					en: 'The menu items in this slot will appear offset in the layout.'
				}
			},
			blocks: [
				createLinkIntBlock({ slots: ['offset'] }),
				createLinkExtBlock(),
				createLangSwitchBlock(),
				createMenuDropDown()
			]
		},
	]
}

export default nav