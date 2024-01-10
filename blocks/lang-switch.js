/* import getAppMode from '../hooks/_getAppMode'
import getSite from '../hooks/getSite'
import cpFile from '../hooks/_cpFile'
import getDoc from '../hooks/getDoc'
import reportError from '../reportError' */

export default function createLangSwitchBlock() {
	const block = {
		slug: 'lang-switch',
		labels: {
			singular: {
				en: 'Language Switcher',
				de: 'Schalter für Spracheinstellung'
			},
			plural: {
				en: 'Language Switcher',
				de: 'Schalter für Spracheinstellung'
			}
		},
		fields: [
			/* {
				type: 'radio',
				name: 'type',
				options: ['icon', 'button'],
				defaultValue: 'icon',
			}, */
			/* {
				type: 'upload',
				name: 'img',
				label: {
					en: 'Image',
					de: 'Bild'
				},
				relationTo: 'images',
				required: true,
			}, */
			{
				type: 'select',
				name: 'icon',
				hasMany: false,
				options: [
					{
						value: 'globebubble',
						label: {
							en: 'Globe with a speech bubble',
							de: 'Globus mit Sprechblase'
						},
					},
					{
						value: 'cardcarousel',
						label: {
							en: 'Language Cards',
							de: 'Sprachkarten'
						},
					},
				],
				defaultValue: 'globebubble',
			},
			{
				type: 'select',
				name: 'languages',
				hasMany: true,
				admin: {
					description: {
						de: 'Es werden für alle Menüpunkte Versionen für jeweils eine der Sprache erstellt. Z.B. www.meine-domain/de/about und www.meine-domain/en/about. Bitte stellen Sie sicher, dass auch inhaltlich eine Version für die entsprechende Sprache hinterlegt ist.',
						en: 'For all menu items language versions are going to be created (www.meine-domain/de/about and www.meine-domain/en/about). Please make sure that the corresponding language content ist set.'
					}
				},
				options: [
					{
						value: 'de',
						label: 'Deutsch',
					},
					{
						value: 'en',
						label: 'English',
					},
				]
			}
		]
	}

	return block
}