import createLinkIntBlock from '../link-int-block'
import createLinkExtBlock from '../link-ext-block'
import createMenuDropDown from '../menu-drop-down'
import createLangSwitchBlock from '../lang-switch'
import createAnchorAttrsFields from '../../fields/anchor-attributes'

const menuSplitBlock = {
	slug: 'menu-split',
	labels: {
		singular: 'Menu Split',
		plural: 'Menu Split'
	},
	// --- fields
	fields: [
		// --- layout
		{
			type: 'group',
			name: 'layout',
			admin: {
				hideGutter: true,
			},
			fields: [
				{
					type: 'row',
					fields: [
						// orientation
						{
							type: 'radio',
							name: 'orientation',
							label: {
								de: 'Orientierung',
								en: 'Orientation'
							},
							defaultValue: 'horizontal',
							admin: {
								width: '50%'
							},
							options: [
								{
									value: 'horizontal',
									label: {
										de: 'Horizontal',
										en: 'Horizontal',
									}
								},
								{
									value: 'vertical',
									label: {
										de: 'Vertikal',
										en: 'Vertical',
									}
								},
							]
						},
						// --- order
						{
							type: 'radio',
							name: 'order',
							label: {
								de: 'Reihenfolge',
								en: 'Order'
							},
							defaultValue: 'offsetDefault',
							admin: {
								width: '50%'
							},
							options: [
								{
									value: 'offsetDefault',
									label: {
										de: 'Offset | Default',
										en: 'Offset | Default',
									}
								},
								{
									value: 'defaultOffset',
									label: {
										de: 'Default | Offset',
										en: 'Default | Offset',
									}
								},
							]
						},
					]
				},
			]
		},
		// --- link
		//createAnchorAttrsFields(),
		// --- blocksDefault
		{
			type: 'blocks',
			name: 'blocksDefault',
			label: {
				de: 'Default Slot',
				en: 'Default Slot'
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
			admin: {
				description: {
					de: 'Hier sollten die meisten Menüpunkte platziert werden.',
					en: 'Most of the menu items should be placed here.'
				}
			},
			minRows: 0,
			maxRows: 6,
			blocks: [
				createLinkIntBlock(),
				createLinkExtBlock(),
				createMenuDropDown(),
				createLangSwitchBlock(),
			]
		},
		// --- blocksOffset
		{
			type: 'blocks',
			name: 'blocksOffset',
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
				description: {
					de: 'Die Menüpunkte in diesem Slot werden von den anderen im Layout abgesetzt.',
					en: 'The menu items in this slot will appear offset in the layout.'
				}
			},
			blocks: [
				createLinkIntBlock(),
				createLinkExtBlock(),
				createMenuDropDown(),
				createLangSwitchBlock(),
			]
		},
	]
}

export default menuSplitBlock

/* fields: [
		// -- slotLeft
		{
			type: 'array',
			name: 'slotLeft',
			label: {
				de: 'Linker Slot',
				en: 'Left Slot'
			},
			fields: [
				// -- blocks
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
						createMenuDropDown(),
					]
				},
			]
		},
		{
			type: 'array',
			name: 'slotRight',
			label: {
				de: 'Rechter Slot',
				en: 'Right Slot'
			},
			fields: [
				// -- blocks
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
						createMenuDropDown(),
					]
				},
			]
		}

	] */