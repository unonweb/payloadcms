/* ACCESS */
import { isAdmin, isAdminFieldLevel } from '../../access/isAdmin';
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* BLOCKS */
import headerBanner from '../../blocks/headers/header-banner';
import createImgBlock from '../../blocks/img-block';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/*  HOOKS & HELPERS */
import getRelatedDoc from '../../hooks/getRelatedDoc';
import log from '../../customLog';
import mailError from '../../mailError';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import updateDocsMany from '../../hooks/updateDocsMany';
import getUserSites from '../../hooks/getUserSites';
import afterChangeHook from './afterChangeHook';
import beforeChangeHook from './beforeChangeHook';
import createAssetsFields from '../../fields/createAssetsFields';
import afterOperationHook from './afterOperationHook';
import beforeOperationHook from './beforeOperationHook';

export const Headers = {
	slug: 'headers',
	admin: {
		group: {
			en: 'Elements',
			de: 'Elemente'
		},
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
			async ({ args, operation }) => beforeOperationHook('headers', { args, operation })
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
			async ({ data, req, operation, originalDoc, context }) => beforeChangeHook('headers', { data, req, operation, originalDoc, context })
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => afterChangeHook('headers', { req, doc, previousDoc, operation, context }),
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, doc, context }) => {
				const user = req?.user?.shortName ?? 'internal'
				log('--- afterDelete ---', user, __filename, 7)

				const siteID = (typeof doc.site === 'string') ? doc.site : doc.site.id
				await updateDocsMany('pages', user, {
					where: {
						and: [
							{ site: { equals: siteID } },
							{ header: { equals: doc.id } },
						]
					},
					data: {
						header: ''
					}
				})
				await updateDocsMany('posts', user, {
					where: {
						and: [
							{ site: { equals: siteID } },
							{ hasOwnPage: { equals: true } },
							{ header: { equals: doc.id } },
						]
					},
					data: { header: '' }
				})
			}
		],
		// --- afterOperation
		afterOperation: [
			async ({ operation, args }) => afterOperationHook('headers', { operation, args })
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
							defaultValue: async ({ user }) => await firstDefaultsToTrue('headers', user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, 'headers'),
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
								de: 'Header Layout',
								en: 'Header Layout'
							},
							labels: { // Customize the block row labels appearing in the Admin dashboard.
								singular: {
									de: 'Header Layout',
									en: 'Header Layout'
								},
								plural: {
									de: 'Header Layout',
									en: 'Header Layout'
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
								createImgBlock(),
							]
						},
					]
				},
			]
		},
	],
}