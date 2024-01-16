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
		/* // --- block.area
		{
			type: 'select',
			name: 'area',
			label: {
				en: 'Placement',
				de: 'Platzierung'
			},
			hasMany: false,
			required: true,
			options: [
				{
					label: {
						en: 'Before the Header',
						de: 'Vor dem Header',
					},
					value: 'headerbefore'
				},
				{
					label: {
						en: 'On top of the Header',
						de: 'Auf dem Header',
					},
					value: 'header'
				},
				{
					label: {
						en: 'After the Header',
						de: 'Nach dem Header',
					},
					value: 'headerafter'
				},
				{
					label: {
						en: 'Aside (left)',
						de: 'Links vom Hauptteil',
					},
					value: 'asideleft',
				},
				{
					label: {
						en: 'Aside (right)',
						de: 'Rechts vom Hauptteil',
					},
					value: 'asideright',
				},
				{
					label: {
						en: 'Before the Footer',
						de: 'Vor dem Footer',
					},
					value: 'footerbefore'
				},
				{
					label: {
						en: 'On top of the Footer',
						de: 'Auf dem Footer',
					},
					value: 'footer'
				},
				{
					label: {
						en: 'After the Footer',
						de: 'Nach dem Footer',
					},
					value: 'footerafter'
				},
			],
			defaultValue: 'headerafter'
		}, */
		/* // --- block.justify
		{
			type: 'radio',
			name: 'justify',
			label: {
				de: 'Ausrichtung',
				en: 'Justify',
			},
			admin: {
				condition: (data) => (data.editingMode === 'layout') ? true : false
			},
			options: [
				{
					value: 'center',
					label: {
						en: 'Center',
						de: 'Zentriert'
					},
				},
				{	
					value: 'left',
					label: {
						en: 'Left',
						de: 'Links'
					},
				},
				{	
					value: 'right',
					label: {
						en: 'Right',
						de: 'Rechts'
					},
				}
			],
			defaultValue: 'center'
		}, */
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
				createLinkIntBlock({ slots: ['offset']}),
				createLinkExtBlock(),
				createLangSwitchBlock(),
				createMenuDropDown()
			]
		},
	]
}

export default nav