/* ACCESS */
import hasSiteAccess from '../../access/hasSiteAccess.js';
import isAdminOrHasSiteAccess from "../../access/isAdminOrHasSiteAccess.js";
import { isLoggedIn } from "../../access/isLoggedIn.js";

/* HOOKS & HELPERS */
import setFilenameToMd5 from '../../hooks/setFilenameToMd5.js';

export const Documents = {
	slug: 'documents',
	/* labels: {
		singular: {
			de: 'Dokument',
			en: 'Document'
		},
		plural: {
			de: 'Dokumente',
			en: 'Documents'
		},
	}, */
	upload: {
		staticURL: '/documents',
		staticDir: '../upload/documents', // cwd is src
		mimeTypes: ['application/pdf'],
	},
	access: {
		create: isLoggedIn,
		update: hasSiteAccess('sites'),
		read: hasSiteAccess('sites'),
		delete: hasSiteAccess('sites'),
	},
	admin: {
		group: 'Upload',
		enableRichTextRelationship: true,
		enableRichTextLink: true,
		useAsTitle: 'title',
		defaultColumns: ['title'],
		description: {
			de: 'Es werden PDF-Daten zum Upload akzeptiert.',
			en: 'Only PDF-files are accepted.'
		}
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => {
				if (operation === 'create') {
					args = await setFilenameToMd5(args)
				}
				return args
			}
		],
	},
	// --- fields
	fields: [
		// --- document.sites
		{
			type: 'relationship',
			name: 'sites',
			relationTo: 'sites',
			required: true,
			hasMany: true,
			defaultValue: ({ user }) => (user && !user?.roles?.includes('admin') && user?.sites?.[0]) ? user.sites[0] : [],
		},
		// --- document.title
		{
			type: 'text',
			name: 'title',
			label: {
				de: 'Titel',
				en: 'Title'
			},
			index: true,
		},
		// --- document.createdByID
		{
			type: 'text',
			name: 'createdByID',
			defaultValue: ({ user }) => (user) ? user.id : '',
			admin: {
				readOnly: true,
				hidden: true,
			}
		},
		// --- document.createdByName
		{
			type: 'text',
			name: 'createdByName',
			label: {
				de: 'Erstellt von Benutzer',
				en: 'Created by User'
			},
			defaultValue: ({ user }) => (user) ? `${user.firstName} ${user.lastName}` : '',
			admin: {
				readOnly: true,
				hidden: true,
			}
		}
	]
}