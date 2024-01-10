/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* BLOCKS */
import createRichTextBlock from '../../blocks/rich-text-block';
import createImgBlock from '../../blocks/img-block';

/* HOOKS & HELPERS */
import rmDocFile from '../../hooks/rmDocFile'
import log from '../../customLog';
import getDoc from '../../hooks/getDoc';
import getRelatedDoc from '../../hooks/getRelatedDoc';
import mailError from '../../mailError';
import saveToDisk from '../../hooks/_saveToDisk';
import createPageElementsField from '../../fields/createPageElementsField';
import getUserSites from '../../hooks/getUserSites';

export const Products = {
	slug: 'products',
	admin: {
		enableRichTextRelationship: false, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: false,
		useAsTitle: 'title',
		defaultColumns: [
			'title',
		],
		description: {
			de: 'Erstelle einen Post. Dieser kann dann auf einer oder mehreren deiner (Sub)Seiten eingebunden werden. Beispiele für Posts sind: Blog-Artikel, Produkte, Veranstaltungen, Termine,...',
			en: 'Create a new post which can then be included in one or multiple of your pages. Examples for posts are: blog articles, products, events, appointments,...',
		},
		group: {
			de: 'Dynamische Inhalte',
			en: 'Dynamic Content'
		},
		pagination: {
			defaultLimit: 30,
		},
	},
	versions: false,
	access: {
		create: isLoggedIn,
		update: isAdminOrHasSiteAccess('site'),
		read: isAdminOrHasSiteAccess('site'),
		delete: isAdminOrHasSiteAccess('site'),
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ operation }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					if (args.req.user) {
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
					}
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [products] "${args.req.context.timeID}"`)
				}
			}
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('--- afterChange ---', user, __filename, 7)

					context.site ??= await getRelatedDoc('sites', doc.site, user)
					const site = context.site

					/* init other locales */
					if (operation === 'create') {
						if (site.locales.used.length > 1 && site.locales.initOthers === true) {
							for (const loc of site.locales.used) {
								if (loc !== req.locale) {
									const updatedDoc = await updateDocSingle('products', doc.id, user, {
										data: doc,
										locale: loc,
									})
								}
							}
						}
					}

					/* save this as own page */
					if (doc.hasOwnPage) {
						/* compose html */
						const html = renderHTMLPage(req.locale, doc, user, {
							header: await getDoc('headers', doc.elements.header, user, { depth: 0, locale: req.locale }),
							nav: await getDoc('navs', doc.elements.nav, user, { depth: 0, locale: req.locale }),
							footer: await getDoc('footers', doc.elements.footer, user, { depth: 0, locale: req.locale })
						})

						const destPath = `${site.paths.fs.site}/products/${doc.id}/${req.locale}/index.html` // <-- ATT: hard-coded value
						await saveToDisk(destPath, html, user, { ctParentPath: true })
					}

					/* save collection to disk */
					for (const loc of site.locales.used) {

						const result = await getCol('products', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const webVersion = createWebVersion(result, req.user)
						const destPath = `${site.paths.fs.products}/${loc}/products.json`
						await saveToDisk(destPath, JSON.stringify(webVersion), user)
					}

					if (hasChanged(doc.assets, previousDoc.assets, user)) {
						/* update site.assets.fromPosts */
						site.assets.fromPosts ??= {} // init 'site.assets.fromPosts'
						site.assets.fromPosts[doc.id] = [...doc.assets.imgs, ...doc.assets.docs]

						await updateDocSingle('sites', site.id, user, {
							data: {
								assets: {
									fromPosts: site.assets.fromPosts
								}
							}
						})
					}

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			},
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, doc, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					context.site ??= await getRelatedDoc('sites', doc.site, user)
					const site = context.site

					/* delete own page */
					if (doc.hasOwnPage) {
						const destPath = `${site.paths.fs.site}/products/${doc.id}/${req.locale}/index.html`
						await rmFile(destPath, user, { recursive: true, throwErrorIfMissing: false })
					}

					/* save collection to disk */
					for (const loc of site.locales.used) {

						const result = await getCol('products', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const webVersion = createWebVersion(result, req.user)
						const destPath = `${site.paths.fs.products}/${loc}/products.json`
						await saveToDisk(destPath, JSON.stringify(webVersion), user)
					}

					/* update site.assets.fromPosts */
					delete site.assets.fromPosts[doc.id]

					await updateDocSingle('sites', site.id, user, {
						data: {
							assets: {
								fromPosts: site.assets.fromPosts
							}
						}
					})

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			},
		],
		// --- afterOperation
		afterOperation: [
			({ operation }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					console.timeEnd(`<7>[time] [products] "${args.req.context.timeID}"`)
				}
			}
		],
	},
	fields: [
		// --- editingMode
		editingModeField,
		// --- TABS
		{
			type: 'tabs',
			tabs: [
				// --- META [tab-1]
				{
					label: 'Meta',
					fields: [
						// --- product.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							maxDepth: 0, // if 1 then for every post the corresponding site is included into the pages collection (surplus data)
							defaultValue: ({ user }) => { // If user is not admin, set the site by default to the first site that they have access to
								if (!user.roles.includes('admin') && user.sites?.[0]) {
									return user.sites[0];
								}
							}
						},
						// --- product.tags
						{
							type: 'relationship',
							relationTo: 'tags',
							name: 'tags',
							label: {
								de: 'Tags',
								en: 'Tags'
							},
							filterOptions: () => {
								return {
									relatedCollection: { equals: 'products' },
								}
							},
							hasMany: true,
							localized: false,
							required: true,
							maxDepth: 1,
							// * if set to 1 then bulk operations include the entire doc in 'originalDoc'
							// * if changed renderHTMLFromBlocks has to be changed, too
							admin: {
								description: {
									de: 'Ein Posts kann mithilfe von Schlagworten in eine oder mehrere deiner Sub(Seiten) eingebunden werden.',
									en: 'By the means of tags a post may be included in one or multiple pages.'
								},
								disableBulkEdit: false, // must be disabled if updatePostCategories() is used
							},
						},
						// --- product.title
						{
							type: 'text',
							name: 'title',
							label: {
								de: 'Titel',
								en: 'Title'
							},
							required: true,
							localized: true,
						},
						// --- product.subtitle
						{
							type: 'text',
							name: 'subtitle',
							label: {
								de: 'Untertitel',
								en: 'Subtitle'
							},
							required: false,
							localized: true,
						},
						// --- product.description
						{
							type: 'textarea',
							name: 'description',
							label: {
								de: 'Kurze Zusammenfassung',
								en: 'Short Summary'
							},
							localized: true,
							maxLength: 190,
							admin: {
								description: {
									de: 'Wichtig für Suchmaschinen. Voraussetzung für die Darstellungsform des Posts als verlinkte Zusammenfassung. Max. Länge: 190 Zeichen.'
								}
							}
						},
						// --- product.img
						{
							type: 'upload',
							name: 'img',
							label: {
								en: 'Featured Image',
								de: 'Meta-Bild'
							},
							relationTo: 'images',
							required: false,
						},
						// --- product.hasOwnPage
						{
							type: 'checkbox',
							name: 'hasOwnPage',
							label: {
								de: 'Dieser Artikel hat (zusätzlich) seine eigene Seite/URL.',
								en: 'This article (additionally) has its own page/URL.'
							},
							defaultValue: true,
						},
						// --- product.elements
						// --- product.elements.header
						// --- product.elements.nav
						// --- product.elements.footer
						createPageElementsField(),
					]
				},
				// --- CONTENT [tab-2] ---
				{
					label: 'Content',
					fields: [
						// --- content - blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								en: 'Content Type',
								de: 'Content Type'
							},
							labels: {
								singular: 'Content Type',
								plural: 'Content Types',
							},
							blocks: [
								createRichTextBlock(),
								createImgBlock(),
							]
						},
					]
				}
			]
		}
	],
}

function createWebVersion(posts = [], user = {}) {

	posts = (posts.docs) ? posts.docs : posts

	return posts.map(doc => {
		return {
			id: doc.id,
			tags: doc.tags,
			title: doc.title,
			time: doc.time,
			html: doc.html.main,
			author: `${user.firstName} ${user.lastName}`,
			date: doc.date,
			updatedAt: doc.updatedAt,
			createdAt: doc.createdAt,
		}
	})
}