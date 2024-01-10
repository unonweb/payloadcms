import createLinkIntBlock from '../link-int-block'
import createLinkExtBlock from '../link-ext-block'
import createLangSwitchBlock from '../lang-switch'
import createMenuDropDown from '../menu-drop-down'

const menuAside = {
	slug: 'menu-aside',
	labels: {
		singular: {
			en: 'Side Menu',
			de: 'Seitliches Menü'
		},
		plural: {
			en: 'Side Menus',
			de: 'Seitliche Menüs'
		}
	},
	fields: [
		{
			type: 'text',
			name: 'area',
			defaultValue: 'aside',
			admin: {
				condition: (data) => {
					if (data.editingMode === 'experimental') {
						return true;
					} else {
						return false;
					}
				}
			}
		},
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
				createLangSwitchBlock(),
			]
		},
	]
}

export default menuAside