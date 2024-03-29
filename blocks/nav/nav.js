import createLangSwitchBlock from '../lang-switch.js';
import createLinkExtBlock from '../link-ext-block.js';
import createLinkIntBlock from '../link-int-block.js';
import createMenuDropDown from '../menu-drop-down.js';

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
			admin: {
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
				description: 'Admin only options'
			},
			fields: [
				// --- block.enableSplit
				{
					type: 'checkbox',
					name: 'enableSplit',
					defaultValue: false,
					admin: {
						width: '25%',
						condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
					}
				},
			]
		},
		{
			type: 'row',
			admin: {
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
				description: 'Admin only options'
			},
			fields: [
				// --- block.sticky
				{
					type: 'select',
					name: 'sticky',
					defaultValue: 'false',
					admin: {
						width: '25%',
						condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
					},
					options: ['true', 'false', 'smart']
				},
				// --- block.isDropDown
				{
					type: 'select',
					name: 'isDropDown',
					defaultValue: 'false',
					admin: {
						width: '25%',
						condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
					},
					options: ['breakpoint', 'false', 'true']
				},
			]
		},
		// --- block.blocks
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
				createLinkIntBlock(),
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
				createLinkIntBlock(),
				createLinkExtBlock(),
				createLangSwitchBlock(),
				createMenuDropDown()
			]
		},
	]
}

export default nav