// ACCESS
import { isLoggedIn } from '../../access/isLoggedIn';

// BLOCKS
import nav from '../../blocks/nav/nav';

// FIELDS
import editingModeField from '../../fields/editingMode';

// HOOKS & HELPERS
import firstDefaultsToTrue from '../../hooks/defaultValue/firstDefaultsToTrue';
import isUniqueDefault from '../../hooks/validate/isUniqueDefault';
import updateRelations from '../../hooks/afterChange/updateRelations';
import createAssetsFields from '../../fields/createAssetsFields';
import afterDeleteHook from './afterDeleteHook';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import copyAssets from '../../hooks/afterChange/copyAssets';
import setMainHTML from '../../hooks/beforeChange/setMainHTML';
import createHTMLFields from '../../fields/createHTMLFields';
import hasSiteAccess from '../../access/hasSiteAccess';

const SLUG = 'navs'
const COLSINGULAR = 'nav'

export const Navs = {
	slug: SLUG,
	labels: {
		singular: {
			de: 'Navigation',
			en: 'Navigation'
		},
		plural: {
			de: 'Navigation',
			en: 'Navigation'
		},
	},
	// --- admin
	admin: {
		group: {
			en: 'Elements',
			de: 'Elemente'
		},
		hideAPIURL: true,
		useAsTitle: 'title',
		defaultColumns: ['title', 'site'],
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	// --- accces
	access: {
		create: isLoggedIn,
		update: hasSiteAccess(),
		read: hasSiteAccess(),
		delete: hasSiteAccess(),
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => populateContextBeforeOp({ args, operation }, ['sites', 'images', 'pages', 'documents']),
		],
		// --- beforeValidate
		beforeValidate: [],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setMainHTML({ data, req, operation, originalDoc, context }),
		],
		// --- afterChange 
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => copyAssets(['images', 'documents'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, operation, context }) => updateRelations('pages', 'nav', { req, doc, previousDoc, operation, context }),
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, doc, context }) => afterDeleteHook(COLSINGULAR, { req, doc, context }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
		],
	},
	// --- fields
	fields: [
		// --- editingMode
		editingModeField,
		// --- tabs
		{
			type: 'tabs',
			tabs: [
				// --- META [tab-1]
				{
					label: 'Meta',
					fields: [
						// --- nav.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : null,
						},
						// --- nav.title
						{
							type: 'text',
							name: 'title',
							unique: false,
							required: false,
							admin: {
								placeholder: {
									en: 'Leave blank for automatic insertion',
									de: 'Frei lassen für automatische Bezeichnung'
								}
							},
							hooks: {
								beforeValidate: [
									({ value, data, context }) => {
										/* default title */
										if (!value) {
											return `${ (data.blocks && data.blocks?.length > 0) ? data.blocks[0].blockType : 'default' } (${context.site.domainShort})` // title of this menu
										}
									}
								]
							}
						},
						// --- nav.isDefault
						{
							type: 'checkbox',
							name: 'isDefault',
							label: {
								de: 'Standard-Navigation',
								en: 'Default Navigation'
							},
							admin: {
								description: {
									en: 'Is automatically picked when creating new pages/posts. Es kann nur eine Navigation als Standard gesetzt werden.',
									de: 'Wird bei der Erstellung neuer Seiten/Posts automatisch hinterlegt. Only one navigation may be set as default.'
								}
							},
							defaultValue: async ({ user }) => await firstDefaultsToTrue(SLUG, user.shortName),
							validate: async (val, { data, payload }) => await isUniqueDefault(val, data, payload, SLUG),
						},
						// --- nav.html.main
						createHTMLFields('main'),
						// --- nav.assets.imgs
						// updated in beforeChange hook
						createAssetsFields('imgs'),
					]
				},
				// --- CONTENT [tab-2]
				{
					label: {
						de: 'Inhalt',
						en: 'Content'
					},
					fields: [
						// --- nav.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								de: ' ',
								en: ' '
							},
							labels: {
								singular: {
									de: 'Navigation',
									en: 'Navigation'
								},
								plural: {
									de: 'Navigationen',
									en: 'Navigations'
								},
							},
							maxRows: 1,
							blocks: [
								nav,
							]
						},
					]
				},
			],
		}
	]
}