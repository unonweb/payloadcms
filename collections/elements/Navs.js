// ACCESS
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';
import { isAdmin } from '../../access/isAdmin';

// BLOCKS
import nav from '../../blocks/navs/nav';

// FIELDS
import editingModeField from '../../fields/editingMode';

// HOOKS & HELPERS
import getRelatedDoc from '../../hooks/getRelatedDoc';
import log from '../../customLog';
import mailError from '../../mailError';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import updateDocsMany from '../../hooks/updateDocsMany';
import afterChangeHook from './afterChangeHook';
import beforeChangeHook from './beforeChangeHook';
import createAssetsFields from '../../fields/createAssetsFields';
import beforeOperationHook from './beforeOperationHook';
import afterOperationHook from './afterOperationHook';
import afterDeleteHook from './afterDeleteHook';

const COLPLURAL = 'navs'
const COLSINGULAR = 'nav'

export const Navs = {
	slug: COLPLURAL,
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
		/* preview: async (doc) => {
			return 'https://manueldieterich.unonweb.local/'
			if (doc.site) {
				const site = (typeof doc.site === 'string') ? await getDoc('sites', doc.site) : doc.site
				const appMode = getAppMode()
				return `${site[appMode].origin}`;
			}
		}, */
	},
	// --- accces
	access: {
		create: isLoggedIn,
		update: isAdminOrHasSiteAccess(),
		read: isAdminOrHasSiteAccess(),
		delete: isAdminOrHasSiteAccess(),
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => beforeOperationHook(COLPLURAL, { args, operation })
		],
		// --- beforeValidate
		beforeValidate: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					if (operation === 'create' || operation === 'update') {
						const user = req?.user?.shortName ?? 'internal'
						log('--- beforeValidate ---', user, __filename, 7)
						/* default values */
						if (!data.title) {
							const user = req?.user?.shortName ?? 'internal'
							context.site ??= await getRelatedDoc('sites', data.site, user)
							const site = context.site
							data.title = `${(data.blocks && data.blocks?.length > 0) ? data.blocks[0].blockType : 'default'} (${site.domainShort})` // title of this menu
						}

						return data
					}
				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => beforeChangeHook(COLPLURAL, { data, req, operation, originalDoc, context })
		],
		// --- afterChange 
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => afterChangeHook(COLPLURAL, { req, doc, previousDoc, operation, context }),
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, doc, context }) => afterDeleteHook(COLSINGULAR, { req, doc, context }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ operation, args }) => afterOperationHook(COLPLURAL, { operation, args })
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
							// If user is not admin, set the site by default
							// to the first site that they have access to
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
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
							}
						},
						/* // --- nav.area
						{
							type: 'select',
							name: 'area',
							hasMany: false,
							required: true,
							options: [
								{
									label: 'header',
									value: 'header'
								},
								{
									label: 'aside',
									value: 'aside',
								},
								{
									label: 'bottom',
									value: 'bottom'
								},
							],
							defaultValue: 'header'
						}, */
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
							defaultValue: async ({ user }) => await firstDefaultsToTrue(COLPLURAL, user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, COLPLURAL),
						},
						// --- nav.html
						{
							type: 'code',
							name: 'html',
							admin: {
								language: 'html',
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							localized: true,
						},
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