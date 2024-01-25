/* ACCESS */
import { isAdmin, isAdminFieldLevel } from '../../access/isAdmin';
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* BLOCKS */
import headerBanner from '../../blocks/headers/header-banner';
import createImgBlock from '../../blocks/img-block';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* HOOKS STANDARD */
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import afterChangeHook from './afterChangeHook';
import beforeChangeHook from './beforeChangeHook';
import createAssetsFields from '../../fields/createAssetsFields';
import afterOperationHook from './afterOperationHook';
import beforeOperationHook from './beforeOperationHook';
import afterDeleteHook from './afterDeleteHook';
import log from '../../customLog';
import mailError from '../../mailError';

/*  HOOKS & HELPERS */
import getRelatedDoc from '../../hooks/getRelatedDoc';
import updateDocsMany from '../../hooks/updateDocsMany';
import getUserSites from '../../hooks/getUserSites';


const COLPLURAL = 'headers'
const COLSINGULAR = 'header'

export const Headers = {
	slug: COLPLURAL,
	admin: {
		group: {
			en: 'Elements',
			de: 'Elemente'
		},
		useAsTitle: 'title',
		hideAPIURL: true,
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	access: {
		create: isLoggedIn,
		update: isAdminOrHasSiteAccess('site'),
		read: isAdminOrHasSiteAccess('site'),
		delete: isAdminOrHasSiteAccess('site'),
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

						/* default title */

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
						// --- header.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							// If user is not admin, set the site by default
							// to the first site that they have access to
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
						},
						// --- header.title
						{
							type: 'text',
							name: 'title',
							unique: false,
							admin: {
								placeholder: {
									en: 'Leave blank for automatic insertion',
									de: 'Frei lassen für automatische Bezeichnung'
								}
							}
						},
						// --- header.isDefault
						{
							type: 'checkbox',
							name: 'isDefault',
							label: {
								de: 'Standard-Header',
								en: 'Default Header'
							},
							admin: {
								description: {
									en: 'Is automatically picked when creating new pages/posts. Es kann nur ein Header als Standard gesetzt werden.',
									de: 'Wird bei der Erstellung neuer Seiten/Posts automatisch hinterlegt. Only one header may be set as default.'
								}
							},
							defaultValue: async ({ user }) => await firstDefaultsToTrue(COLPLURAL, user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, COLPLURAL),
						},
						// --- header.html
						{
							type: 'code',
							name: 'html',
							admin: {
								language: 'html',
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							localized: true,
						},
						// --- header.assets.imgs
						// updated in beforeChange hook
						createAssetsFields('imgs'),
					]
				},
				// --- content [tab-2]
				{
					label: {
						de: 'Inhalt',
						en: 'Content'
					},
					fields: [
						// --- header.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								de: 'Header Block',
								en: 'Header Block'
							},
							labels: { // Customize the block row labels appearing in the Admin dashboard.
								singular: {
									de: 'Header Block',
									en: 'Header Block'
								},
								plural: {
									de: 'Header Block',
									en: 'Header Block'
								},
							},
							maxRows: 1,
							/* defaultValue: [
								{
									blockType: 'header-banner'
								}
							], */
							blocks: [
								headerBanner,
							]
						},
					]
				},
			]
		},
	],
}