import hasSiteAccess from '../access/hasSiteAccess.js';
import { isLoggedIn } from "../access/isLoggedIn.js";
import createCommonFields from '../fields/createCommonFields.js';
import updateOtherLocale from '../hooks/afterChange/updateOtherLocale.js';
import populateContextBeforeOp from '../hooks/beforeOperation/populateContext.js';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime.js';
import isUnique from '../hooks/validate/isUnique.js';

const commonFields = createCommonFields()
const SLUG = ' tags'

export const Tags = {
	slug: 'tags',
	labels: {
		singular: {
			de: 'Schlagwort',
			en: 'Tag'
		},
		plural: {
			de: 'Tags',
			en: 'Tags'
		},
	},
	admin: {
		useAsTitle: 'name',
		group: {
			de: 'Posts',
			en: 'Posts'
		},
		description: {
			de: 'Es werden Tags angezeigt, die man selbst erstellt hat. Außerdem Tags, die der Admin erstellt hat.',
			en: 'Only Tags are shown created by the user himself/herself. Additionally tags created by the admin are shown.'
		},
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	access: {
		create: isLoggedIn,
		update: hasSiteAccess('sites'),
		read: hasSiteAccess('sites', { allSitesOption: true }),
		delete: hasSiteAccess('sites'),
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => await startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => await updateOtherLocale({ req, doc, previousDoc, context, operation }) // use this because the 'title' field of tags is localized and it happens easily not to set it
		]
	},
	fields: [
		// --- tag.sites
		{
			type: 'relationship',
			relationTo: 'sites',
			name: 'sites',
			required: true,
			hasMany: true,
			maxDepth: 0,
			// If user is not admin, set the site by default
			// to the first site that they have access to
			defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : [],
			admin: {
				condition: (data, siblingData, { user }) => (siblingData.allSites === true) ? false : true,
			}
		},
		//--- tag.allSites
		{
			type: 'checkbox',
			name: 'allSites',
			label: 'Make available on all sites',
			defaultValue: false,
			admin: {
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
			}
		},
		// --- tag.relatedCollection
		{
			name: 'relatedCollection',
			type: 'select',
			hasMany: false,
			required: true,
			options: [
				{
					label: 'Images',
					value: 'images'
				},
				{
					label: 'Pages',
					value: 'pages',
				},
				{
					label: 'Events',
					value: 'events'
				},
				{
					label: 'Libraries',
					value: 'lib'
				},
				{
					label: 'Posts',
					value: 'posts-flex'
				},
			],
		},
		// --- tag.name
		{
			type: 'text',
			name: 'name',
			label: 'Name',
			required: true,
			localized: true,
			index: true,
			validate: async (val, { data, payload, user, siblingData, id }) => await isUnique(SLUG, 'name', val, { data, payload }),
		},
		// --- tag.img
		{
			type: 'upload',
			name: 'img',
			label: {
				en: 'Thumbnail / Icon',
				de: 'Thumbnail / Icon'
			},
			relationTo: 'images',
			required: false,
		},
		// --- commonFields
		...commonFields,
	],
}