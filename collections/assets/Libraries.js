/* ACCESS */
import isAdminOrHasSiteAccess from "../../access/isAdminOrHasSiteAccess.js";
import { isLoggedIn } from "../../access/isLoggedIn.js";
import { isAdmin } from '../../access/isAdmin.js';

/* HOOKS & HELPERS */
import setFilenameToMd5 from '../../hooks/setFilenameToMd5.js';

export const Libraries = {
	slug: 'lib',
	labels: {
		singular: {
			de: 'Programmbibliothek',
			en: 'Library'
		},
		plural: {
			de: 'Programmbibliotheken',
			en: 'Libraries'
		},
	},
	upload: {
		staticURL: '/lib',
		staticDir: 'upload/lib',
		mimeTypes: ['text/javascript', 'text/css'],
	},
	access: {
		create: isAdmin,
		update: isAdmin,
		read: isAdmin,
		delete: isAdmin,
	},
	admin: {
		group: 'Upload',
		enableRichTextRelationship: false,
		enableRichTextLink: false,
		useAsTitle: 'tags',
		defaultColumns: ['tags', 'filename']
	},
	// --- fields
	fields: [
		// --- sites
		/* {
			type: 'relationship',
			name: 'sites',
			relationTo: 'sites',
			required: true,
			hasMany: true,
			// If user is not admin, set the site by default
			// to the first site that they have access to
			defaultValue: ({ user }) => {
				if (!user.roles.includes('admin') && user.sites?.[0]) {
					return user.sites[0];
				}
			}
		}, */
		// --- lib.tags
		{
			type: 'relationship',
			relationTo: 'tags',
			name: 'tags',
			label: {
				de: 'Tags',
				en: 'Tags'
			},
			filterOptions: () => {
				return {
					relatedCollection: { equals: 'lib' },
				}
			},
			hasMany: false,
			index: true,
		},
		// --- lib.version
		{
			type: 'text',
			name: 'version',
		},
	]
}