/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* HOOKS STANDARD */
import afterChangeHook from './afterChangeHook';
import beforeChangeHook from './beforeChangeHook';
import beforeOperationHook from './beforeOperationHook';
import afterOperationHook from './afterOperationHook';
import afterDeleteHook from './afterDeleteHook';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import createAssetsFields from '../../fields/createAssetsFields';

/* BLOCKS */
import createImgBackgroundBlock from '../../blocks/img/img-background';

const COLPLURAL = 'backgrounds'
const COLSINGULAR = 'background'

export const Backgrounds = {
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
		hidden: true,
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
		// --- tabs
		{
			type: 'tabs',
			tabs: [
				// --- META [tab-1]
				{
					label: 'Meta',
					fields: [
						// --- background.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
						},
						// --- background.title
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
						// --- background.isDefault
						{
							type: 'checkbox',
							name: 'isDefault',
							label: {
								de: 'Standard',
								en: 'Default'
							},
							admin: {
								description: {
									en: 'Is automatically picked when creating new pages/posts. Only one element may be set as default.',
									de: 'Wird bei der Erstellung neuer Seiten/Posts automatisch hinterlegt. Es kann nur ein Element als Standard gesetzt werden.'
								}
							},
							defaultValue: async ({ user }) => await firstDefaultsToTrue(COLPLURAL, user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, COLPLURAL),
						},
						// --- background.html
						{
							type: 'code',
							name: 'html',
							admin: {
								language: 'html',
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							localized: true,
						},
						// --- background.assets.imgs
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
						// --- background.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								de: 'Background Block',
								en: 'Background Block'
							},
							labels: { // Customize the block row labels appearing in the Admin dashboard.
								singular: {
									de: 'Background Block',
									en: 'Background Block'
								},
								plural: {
									de: 'Background Block',
									en: 'Background Block'
								},
							},
							maxRows: 1,
							//defaultValue: [ { blockType: 'header-banner' } ],
							blocks: [
								createImgBackgroundBlock(),
							]
						},
					]
				}
			]
		}
	]
}