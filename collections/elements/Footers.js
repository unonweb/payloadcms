/* ACCESS */
import { isAdmin } from '../../access/isAdmin';
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* BLOCKS */
import footerDefault from '../../blocks/footers/footer-default';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/*  HOOKS */
import getRelatedDoc from '../../hooks/getRelatedDoc';
import log from '../../customLog';
import mailError from '../../mailError';
import updateDocsMany from '../../hooks/updateDocsMany';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import pageElementAfterChange from './afterChangeHook';
import pageElementBeforeChange from './beforeChangeHook';
import createAssetsFields from '../../fields/createAssetsFields';
import beforeOperationHook from './beforeOperationHook';
import afterOperationHook from './afterOperationHook';

export const Footers = {
	slug: 'footers',
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
			async ({ args, operation }) => beforeOperationHook('footers', { args, operation })
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
							const site = await getRelatedDoc('sites', data.site, user)
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
			async ({ data, req, operation, originalDoc, context }) => pageElementBeforeChange('footers', { data, req, operation, originalDoc, context })
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => pageElementAfterChange('footers', { req, doc, previousDoc, operation, context }),
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
							{ footer: { equals: doc.id } },
						]
					},
					data: {
						footer: ''
					}
				})
				await updateDocsMany('posts', user, {
					where: {
						and: [
							{ site: { equals: siteID } },
							{ hasOwnPage: { equals: true } },
							{ footer: { equals: doc.id } },
						]
					},
					data: { footer: '' }
				})
			}
		],
		// --- afterOperation
		afterOperation: [
			async ({ operation, args }) => afterOperationHook('footers', { operation, args })
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
							admin: {
								description: {
									en: 'Is automatically picked when creating new pages/posts. Es kann nur eine Navigation als Standard gesetzt werden.',
									de: 'Wird bei der Erstellung neuer Seiten/Posts automatisch hinterlegt. Only one navigation may be set as default.'
								}
							},
							defaultValue: async ({ user }) => await firstDefaultsToTrue('footers', user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, 'footers'),
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
						// --- footer.assets
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
								footerDefault
							]
						},
					]
				},
			]
		}
	],
}