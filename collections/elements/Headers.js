/* ACCESS */
import { isLoggedIn } from '../../access/isLoggedIn';

/* BLOCKS */
import headerBanner from '../../blocks/header/header-banner';

/* FIELDS */

/* HOOKS STANDARD */
import firstDefaultsToTrue from '../../hooks/defaultValue/firstDefaultsToTrue';
import isUniqueDefault from '../../hooks/validate/isUniqueDefault';
import updateRelations from '../../hooks/afterChange/updateRelations';
import createAssetsFields from '../../fields/createAssetsFields';
import afterDeleteHook from './afterDeleteHook';

/*  HOOKS & HELPERS */
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import copyAssets from '../../hooks/afterChange/copyAssets';
import setMainHTMLPage from '../../hooks/beforeChange/setMainHTMLPage';
import createHTMLFields from '../../fields/createHTMLFields';
import hasSiteAccess from '../../access/hasSiteAccess';


const SLUG = 'headers'
const COLSINGULAR = 'header'

export const Headers = {
	slug: SLUG,
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
		update: hasSiteAccess('site'),
		read: hasSiteAccess('site'),
		delete: hasSiteAccess('site'),
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		// --- beforeValidate
		beforeValidate: [],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setMainHTMLPage({ data, req, operation, originalDoc, context }),
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => copyAssets(['images', 'documents'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, operation, context }) => updateRelations('pages', 'header', { req, doc, previousDoc, operation, context }),
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
							defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : null,
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
							defaultValue: async ({ user }) => await firstDefaultsToTrue(SLUG, user.shortName),
							validate: async (val, { data, payload }) => await isUniqueDefault(val, data, payload, SLUG),
						},
						// --- header.html.main
						createHTMLFields('main'),
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