// ACCESS
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';
import { isAdmin } from '../../access/isAdmin';

// BLOCKS
import menuSplitBlock from '../../blocks/navs/menu-split-block';
import menuAside from '../../blocks/navs/menu-aside-block';
import navBar from '../../blocks/navs/nav-bar-block';

// FIELDS
import editingModeField from '../../fields/editingMode';

// HOOKS & HELPERS
import getRelatedDoc from '../../hooks/getRelatedDoc';
import log from '../../customLog';
import mailError from '../../mailError';
import updateRelatedPages from '../../hooks/updateRelatedPages';
import firstDefaultsToTrue from '../../hooks/firstDefaultsToTrue';
import validateIsDefault from '../../hooks/validate/validateIsDefault';
import getAppMode from '../../hooks/_getAppMode';
import updateDocsMany from '../../hooks/updateDocsMany';
import updateElementData from '../../hooks/pageElementBeforeChange';
import updateDocSingle from '../../hooks/updateDocSingle';
import getUserSites from '../../hooks/getUserSites';
import cpAssets from '../../hooks/_cpAssets';
import pageElementAfterChange from '../../hooks/pageElementAfterChange';
import pageElementBeforeChange from '../../hooks/pageElementBeforeChange';

export const Navs = {
	slug: 'navs',
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
			async ({ operation, args }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					if (args.req.user) {
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
					}
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [nav] "${args.req.context.timeID}"`)
				}
			}
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
			async ({ data, req, operation, originalDoc, context }) => pageElementBeforeChange('navs', { data, req, operation, originalDoc, context })
		],
		// --- afterChange 
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => pageElementAfterChange('navs', { req, doc, previousDoc, operation, context }),
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
							{ nav: { equals: doc.id } },
						]
					},
					data: {
						nav: ''
					}
				})

				await updateDocsMany('posts', user, {
					where: {
						and: [
							{ site: { equals: siteID } },
							{ hasOwnPage: { equals: true } },
							{ nav: { equals: doc.id } },
						]
					},
					data: { nav: '' }
				})
			}
		],
		// --- afterOperation
		afterOperation: [
			({ operation, args }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					console.timeEnd(`<7>[time] [nav] "${args.req.context.timeID}"`)
				}
			}
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
							defaultValue: async ({ user }) => await firstDefaultsToTrue('navs', user.shortName),
							validate: async (val, { data, payload }) => await validateIsDefault(val, data, payload, 'navs'),
						}
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
								de: 'Menü Layout',
								en: 'Menu Layout'
							},
							labels: {
								singular: {
									de: 'Menü Layout',
									en: 'Menu Layout'
								},
								plural: {
									de: 'Menü Layouts',
									en: 'Menu Layouts'
								},
							},
							maxRows: 1,
							blocks: [
								//menuSplitBlock,
								//menuAside,
								navBar
							]
						},
					]
				},
				// --- ADMIN [tab-3]
				{
					label: {
						de: 'Admin',
						en: 'Admin'
					},
					fields: [
						// --- nav.html
						{
							type: 'code',
							name: 'html',
							admin: {
								language: 'html'
							},
							localized: true,
							access: {
								update: isAdmin,
							},
						},
						// --- nav.imgs
						{
							type: 'json',
							name: 'imgs',
							access: {
								update: isAdmin,
							},
							localized: false,
							defaultValue: [],
						},
					]
				}
			],
		}
	]
}