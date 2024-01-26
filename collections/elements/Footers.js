/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* HOOKS STANDARD */
import afterChangeHook from './afterChangeHook';
import beforeChangeHook from './beforeChangeHook';
import createAssetsFields from '../../fields/createAssetsFields';
import beforeOperationHook from './beforeOperationHook';
import afterOperationHook from './afterOperationHook';
import getRelatedDoc from '../../hooks/getRelatedDoc';
import log from '../../customLog';
import mailError from '../../mailError';

/* BLOCKS */
import footerDefault from '../../blocks/footers/footer-default';

/*  HOOKS ADD */
import updateDocsMany from '../../hooks/updateDocsMany';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import isUniqueDefault from '../../hooks/validate/isUniqueDefault';
import createRichTextBlock from '../../blocks/rich-text-block';
import afterDeleteHook from './afterDeleteHook';

const COLPLURAL = 'footers'
const COLSINGULAR = 'footer'

export const Footers = {
	slug: COLPLURAL,
	admin: {
		group: {
			en: 'Elements',
			de: 'Elemente'
		},
		hideAPIURL: true,
		useAsTitle: 'title',
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
						/* default values */
						if (!data.title) {
							const user = req?.user?.shortName ?? 'internal'
							context.site ??= await getRelatedDoc('sites', data.site, user)
							const site = context.site
							data.title = `${(data.blocks && data.blocks.length > 0) ? data.blocks[0].blockType : 'default'} (${site.domainShort})` // title of this menu
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
		{
			type: 'tabs',
			tabs: [
				// --- META [tab-1]
				{
					label: 'Meta',
					fields: [
						// --- footer.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							// If user is not admin, set the site by default
							// to the first site that they have access to
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
						},
						// --- footer.title
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
						// --- footer.isDefault
						{
							type: 'checkbox',
							name: 'isDefault',
							label: {
								de: 'Standard-Navigation',
								en: 'Default Navigation'
							},
							unique: false,
							required: false,
							admin: {
								description: {
									en: 'Is automatically picked when creating new pages/posts. Only one element out of this collection may be set as default.',
									de: 'Wird bei der Erstellung neuer Seiten/Posts automatisch hinterlegt. Es kann nur ein Element aus dieser Kollektion als Standard gesetzt werden.'
								}
							},
							defaultValue: async ({ user }) => await firstDefaultsToTrue(COLPLURAL, user.shortName),
							validate: async (val, { data, payload }) => await isUniqueDefault(val, data, payload, COLPLURAL),
						},
						// --- footer.html
						{
							type: 'code',
							name: 'html',
							admin: {
								language: 'html',
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							localized: true,
						},
						// --- footer.assets.imgs
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
						// --- footer.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								de: 'Footer Layout',
								en: 'Footer Layout'
							},
							labels: {
								singular: {
									de: 'Footer Layout',
									en: 'Footer Layout'
								},
								plural: {
									de: 'Footer Layout',
									en: 'Footer Layout'
								},
							},
							maxRows: 1,
							/* defaultValue: [
								{
									blockType: 'footer-default'
								}
							], */
							blocks: [
								createRichTextBlock()
							]
						},
					]
				},
			]
		}
	],
}