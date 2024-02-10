/* ACCESS */
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */

/* HOOKS STANDARD */
import updateRelations from '../../hooks/afterChange/updateRelations';
import createAssetsFields from '../../fields/createAssetsFields';

/* BLOCKS */

/*  HOOKS ADD */
import firstDefaultsToTrue from '../../hooks/defaultValue/firstDefaultsToTrue';
import isUniqueDefault from '../../hooks/validate/isUniqueDefault';
import createRichTextBlock from '../../blocks/rich-text-block';
import afterDeleteHook from './afterDeleteHook';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import copyAssets from '../../hooks/afterChange/copyAssets';
import setPageMainHTML from '../../hooks/beforeChange/setMainHTMLPage';
import createHTMLFields from '../../fields/createHTMLFields';
import hasSiteAccess from '../../access/hasSiteAccess';

const SLUG = 'footers'
const COLSINGULAR = 'footer'

export const Footers = {
	slug: SLUG,
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
		update: hasSiteAccess('site'),
		read: hasSiteAccess('site'),
		delete: hasSiteAccess('site'),
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => populateContextBeforeOp({ args, operation }, ['sites']),
		],
		// --- beforeValidate
		beforeValidate: [],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setPageMainHTML({ data, req, operation, originalDoc, context }),
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => copyAssets(['images', 'documents'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, operation, context }) => updateRelations('pages', 'footer', { req, doc, previousDoc, operation, context }),
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
							defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : null,
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
							defaultValue: async ({ user }) => await firstDefaultsToTrue(SLUG, user.shortName),
							validate: async (val, { data, payload }) => await isUniqueDefault(val, data, payload, SLUG),
						},
						// --- footer.html.main
						createHTMLFields('main'),
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