import { deployButton } from '../components/deploy-button'

export const deployButtonField = {
	type: 'ui',
	name: 'deployButton',
	label: {
		de: 'Veröffentlichen',
		en: 'Publish'
	},
	admin: {
		position: "sidebar",
		components: {
			Field: deployButton,
		}
	}
}