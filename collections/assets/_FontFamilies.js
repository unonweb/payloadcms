/* ACCESS */
import { isLoggedIn } from "../../access/isLoggedIn.js";

/* HOOKS & HELPERS */

export const _FontFamilies = {
	slug: 'font-families',
	labels: {
		singular: {
			de: 'Schriftart-Familie',
			en: 'Font Family'
		},
		plural: {
			de: 'Schriftarten-Familien',
			en: 'Font-Families'
		},
	},
	access: {
		create: isLoggedIn,
		update: isLoggedIn,
		read: isLoggedIn,
		delete: isLoggedIn,
	},
	admin: {
		group: 'Upload',
		hidden: true,
		useAsTitle: 'name',
		defaultColumns: ['name'],
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	fields: [
		// --- fontFamily
		{
			type: 'text',
			name: 'name',
			label: {
				de: 'Name der Schriftart (Font Family)',
				en: 'Font Family Name'
			},
			required: true,
			admin: {
				description: {
					en: 'Important: Use the name of the font family (e.g. "RobotoCondensed") instead of the name of the font variant (e.g. "RobotoCondensed-Bold")',
					de: 'Achtung: Es ist wichtig den Familiennamen der Schriftart zu verwenden (z.B. "RobotoCondensed") anstelle des Namens der Variante (z.B. "RobotoCondensed-Bold")'
				}
			},
		}
	]
}

//export default FontFamilies