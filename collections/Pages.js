/* ACCESS */
import isAdminOrHasSiteAccess from '../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../access/isLoggedIn';
import { isAdmin } from '../access/isAdmin';

/* FIELDS */
import editingModeField from '../fields/editingMode';

/* BLOCKS */
import createColumnsFlex from '../blocks/layout/lay-flex';
import createIncludePostsBlock from '../blocks/include-posts'

/* NODE */
import { basename } from 'path'

/* HOOKS & HELPERS */
import hasChanged from '../hooks/_hasChanged';
import getRelatedDoc from '../hooks/getRelatedDoc';
import validateIsHome from '../hooks/validate/validateIsHome';
import saveToDisk from '../hooks/_saveToDisk';
import rmFile from '../hooks/_rmFile';
import iterateBlocks from '../hooks/iterateBlocks';
import getCol from '../hooks/_getCol';
import log from '../customLog';
import mailError from '../mailError';
import cpFile from '../hooks/_cpFile';
import renderHTMLHead from '../hooks/renderHTMLHead';
import updateDocSingle from '../hooks/updateDocSingle';
import getDoc from '../hooks/getDoc';
import validatePageTitle from '../hooks/validate/validatePageTitle';
import slugify from '../hooks/_slugify';
import renderHTMLPage from '../hooks/renderHTMLPage';
import getDefaultDocID from '../hooks/getDefaultDocID';
import getAppMode from '../hooks/_getAppMode';
import getUserSites from '../hooks/getUserSites';
import cpAssets from '../hooks/_cpAssets';
import canAccess from '../hooks/_canAccess';
import convertJSONToCSS from '../hooks/_convertJSONToCSS';

export const Pages = {
	slug: 'pages',
	admin: {
		useAsTitle: 'title',
		defaultColumns: [
			'title',
			'updatedAt',
			'isHome'
		],
		listSearchableFields: ['title'], // make sure you index each of these fields so your admin queries can remain performant.
		description: {
			de: 'Erstelle neue (Sub-)Seiten.',
			en: 'Create new (sub)-pages.'
		},
		group: {
			de: 'Pages',
			en: 'Pages'
		},
		enableRichTextRelationship: true,
		enableRichTextLink: true,
		hideAPIURL: true,
		livePreview: {
			//url: 'http://localhost:8000/index.html', // The URL to your front-end, this can also be a function (see below)
			url: 'http://localhost:3000/preview.html'
			//url: '/home/payload/preview/dist/index.html'
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
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					// if this page is updated internally by another localized version of the same page
					// 'args.req.context.sites' is already set by the update operation
					if (args.req.user) {
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
					}
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [pages] "${args.req.context.timeID}"`)

					if (args.req.user && args.req.user.sites.length === 1) {
						// applies only if user has only one site <-- interim solution
						const siteID = args.req.user.sites[0].id ?? args.req.user.sites[0]

						args.req.context.images = await getCol('images', args.req.user.shortName, {
							depth: 0,
							where: { sites: { contain: siteID } }
						})
						args.req.context.documents = await getCol('documents', args.req.user.shortName, {
							depth: 0,
							where: { sites: { contain: siteID } }
						})
						args.req.context.pages = await getCol('pages', args.req.user.shortName, {
							depth: 0,
							where: { site: { equals: siteID } },
						})
					}
				}

			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('--- beforeChange ---', user, __filename, 7)
					const mode = getAppMode()
					context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : await getRelatedDoc('sites', data.site, user)
					const site = context.site
					const pathSite = `${site.paths.fs.site}/${mode}`

					/* render html from page.blocks and update used assets */

					if (data.main.blocks && data.main.blocks.length > 0) {
						if (mode === 'dev' || operation === 'create' || !data.html.main || hasChanged(data.main.blocks, originalDoc?.main.blocks, user)) {
							// data contains the current values
							// originalDoc contains the previous values
							// seems to work with bulk operations, too
						}

						/* iterate blocks */

						const images = context?.images ?? await getCol('images', user, {
							depth: 0,
							where: { sites: { contain: site.id } }
						})

						const documents = context?.documents ?? await getCol('documents', user, {
							depth: 0,
							where: { sites: { contain: site.id } }
						})

						const pages = context?.pages ?? await getCol('pages', user, {
							depth: 0,
							where: { site: { equals: site.id } },
						})

						const { html, imgFiles, docFiles, libPathsWeb } = iterateBlocks(data, {
							user: user,
							locale: req.locale,
							blocks: data.main.blocks,
							site: site,
							images: images.docs,
							documents: documents.docs,
							pages: pages.docs,
						})

						for (const path of libPathsWeb) {
							// '/assets/lib/leaflet-1.9.4.css'
							// '/assets/custom-elements/un-map-leaflet.js'
							if (path.startsWith('/assets/lib/')) {
								// only care about lib files because separate c-elements files are copied via a standalone script
								const dest = `${pathSite}${path}`
								const src = `${site.paths.fs.admin.resources}${path}`
								await cpFile(src, dest, user, { overwrite: false, ctParentPath: true })
							}
						}

						/* update page */
						data.html.main = html // update page.html.main
						data.assets.imgs = imgFiles // update page.assets.imgs
						data.assets.docs = docFiles	// update page.assets.docs
						data.assets.head = libPathsWeb // update page.assets.head
					}

					data.html.head = await renderHTMLHead(data, site, user) // update page.html.head

					return data

				} catch (err) {
					log(err.stack, user, __filename, 3)
				}
			}
		],
		// --- afterChange 
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('--- afterChange ---', user, __filename, 7)
					context.site ??= (typeof doc.site === 'string' && context.sites) ? context.sites.find(item => item.id === doc.site) : await getRelatedDoc('sites', doc.site, user)
					const site = context.site
					const mode = getAppMode()
					const pathSite = `${site.paths.fs.site}/${mode}`
					const defLang = site.locales.default

					/* init other locales */
					if (operation === 'create') {
						if (site.locales.used.length > 1 && site.locales.initOthers === true) {
							for (const loc of site.locales.used) {
								if (loc !== req.locale) {
									const updatedDoc = await updateDocSingle('pages', doc.id, user, {
										data: doc,
										locale: loc,
									})
								}
							}
						}
					}

					if (mode === 'dev' || doc.html !== previousDoc.html || doc.title !== previousDoc.title || doc.description !== previousDoc.description || doc.isHome !== previousDoc.isHome || doc.header !== previousDoc.header || doc.nav !== previousDoc.nav || doc.footer !== previousDoc.footer) {
						// something has changed...
						// Tasks:
						// * get all elements (header, nav, footer) that compose this page
						// * create a list of all assets required by this page
						// * add page assets to web space
						// * all obsolete files will be cleaned up in the logout hook
					}

					/* elements html */
					const header = (doc.header) ? await getDoc('headers', doc.header, user, { depth: 0, locale: req.locale }) : null
					const nav = (doc.nav) ? await getDoc('navs', doc.nav, user, { depth: 0, locale: req.locale }) : null
					const footer = (doc.footer) ? await getDoc('footers', doc.footer, user, { depth: 0, locale: req.locale }) : null
					//const header = null
					//const nav = null
					//const footer = null

					/* site assets */
					// --------------------
					const docFilesUnique = Array.from(new Set(
						[
							...doc.assets.docs ?? ''
						]
					))
					const imgFilesUnique = Array.from(new Set(
						[
							...doc.assets.imgs ?? '',
							...header?.imgs ?? '',
							...nav?.imgs ?? '',
							...footer?.imgs ?? '',
						]
					))

					/* cp assets */
					await cpAssets(`${process.cwd()}/upload/documents/`, `${pathSite}/assets/docs`, docFilesUnique, user) // cp docs from src to dest
					await cpAssets(`${process.cwd()}/upload/images/`, `${pathSite}/assets/imgs`, imgFilesUnique, user) // cp imgs from src to dest

					/* compose html */
					const pageHTML = renderHTMLPage(req.locale, doc, user, {
						// pass html or undefined:
						navHTML: nav?.html,
						headerHTML: header?.html,
						footerHTML: footer?.html,
					})

					/* save subpage */
					if (doc.isHome === false) {
						const path = `${pathSite}/${req.locale}/${doc.slug}/index.html`
						await saveToDisk(path, pageHTML, user) // save current locale page
					}

					/* save homepage */
					if (doc.isHome === true) {
						const path = `${pathSite}/${req.locale}/index.html` // '/home/payload/sites/manueldieterich/en/index.html'
						await saveToDisk(path, pageHTML, user) // save current localized home
						if (req.locale === defLang) {
							await saveToDisk(`${pathSite}/index.html`, pageHTML, user) // save additional non-localized home
						}

						/* save other localized home */
						/* if (site.locales.used.length > 1) {
							for (const loc of site.locales.used.filter(item => item !== req.locale)) {
								const otherDoc = await getDoc('pages', doc.id, user, { locale: loc })
								if (otherDoc) {
									const otherHTML = renderHTMLPage(loc, otherDoc, user, {
										nav: nav,
										header: header,
										footer: footer
									})
									const otherPath = `${pathSite}/${loc}/index.html`
									await saveToDisk(otherPath, otherHTML, user) // save localized home
									if (loc === defLang) {
										await saveToDisk(`${pathSite}/index.html`, otherHTML, user) // save additional non-localized home
									}
								}
							}
						} */
					}

					/* save other locale pages */
					// always because any non-localized layout or style property may have changed
					if (site.locales.used.length > 1 && context.buildOtherLocale !== false) {
						for (const loc of site.locales.used.filter(item => item !== req.locale)) {

							const updatedDoc = updateDocSingle('pages', doc.id, user, {
								data: { updatedBy: `${user}-${Date.now()}` },
								locale: loc,
								context: {
									// set a flag to prevent from running again
									buildOtherLocale: false,
									sites: context.sites,
									site: site,
									nav: nav,
									header: header,
									footer: footer
								},
							})
						}
					}

					/* remove previous page */
					if (doc.slug !== previousDoc.slug && previousDoc.slug !== '') {
						// slug has changed and is not empty
						for (const loc of site.locales.used) {
							await rmFile(`${pathSite}/${loc}/${previousDoc.slug}`, user, { recursive: true, throwErrorIfMissing: false }) // remove former directory if slug has changed
						}
					}

					/* update site.assets.fromPages */
					site.assets.fromPages ??= {} // init 'site.assets.fromPages'
					site.assets.fromPages[doc.id] = [...imgFilesUnique, ...docFilesUnique]

					/* update 'sites' */
					// * very useful because it triggers the site's hooks so that we can make sure that user.css and fonts.css are there
					await updateDocSingle('sites', site.id, user, {
						data: site
					})

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
					log('--- afterDelete ---', user, __filename, 7)
					if (context.siteIsDeleted === true) {
						return
					}
					else {
						context.site ??= await getRelatedDoc('sites', doc.site, user)
						const site = context.site

						if (site) {
							// if afterDelete is triggered because site is deleted - there won't be not site anymore (surprise!)

							/* update site.assets.fromPages */

							delete site.assets.fromPages[doc.id]

							await updateDocSingle('sites', site.id, user, {
								data: {
									assets: {
										fromPages: site.assets.fromPages
									}
								}
							})

							/* update filesystem */
							// this is done now in cleanUpSite

							/* const pathSite = site.paths.fs.site
							switch (doc.isHome) {

								case true:
									await rmFile(`${pathSite}/index.html`, user)
									for (const loc of site.locales.used) { // <-- IMP!
										await rmFile(`${pathSite}/${loc}/index.html`, user)
									}
									break

								case false:
									for (const loc of site.locales.used) { // <-- IMP!
										await rmFile(`${pathSite}/${loc}/${doc.slug}`, user, { recursive: true }) // remove directory containing index.html
									}
									break
							} */
						}
					}
				} catch (err) {
					log(err.stack, user, __filename, 3)
				}
			}
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					console.timeEnd(`<7>[time] [pages] "${args.req.context.timeID}"`)
				}
			}
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
						// --- page.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							required: true,
							// If user is not admin, set the site by default
							// to the first site that they have access to
							defaultValue: ({ user }) => {
								if (!user.roles.includes('admin') && user.sites?.[0]) {
									return user.sites[0];
								}
							}
						},
						// --- page.title
						{
							type: 'text',
							name: 'title',
							label: {
								de: 'Titel der Seite',
								en: 'Page Title'
							},
							required: true,
							localized: true,
							index: true,
							admin: {
								disableBulkEdit: true,
							},
							validate: async (val, { data, operation, t, payload }) => await validatePageTitle(val, data, payload, t), // return either true or a string error message
						},
						// --- page.tags
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
									relatedCollection: { equals: 'pages' },
								}
							},
							hasMany: true,
							required: false,
							admin: {
								condition: (data) => (data.editingMode === 'functional') ? true : false,
								description: {
									de: 'Optional. Hilft den Überblick zu behalten.',
									en: 'Optional. Helps to sort pages in the admin panel.'
								}
							},
						},
						// --- page.description
						{
							type: 'textarea',
							name: 'description',
							label: {
								de: 'Beschreibung der Website',
								en: 'Website Description'
							},
							localized: true,
							maxLength: 190,
							admin: {
								description: 'Diese Beschreibung kommt in die Meta-Daten der Website und wird in den Ergebnissen von Suchmaschinen angezeigt. Max. Länge: 190 Zeichen.'
							}
						},
						// --- row
						{
							type: 'row',
							fields: [
								// --- page.isHome
								{
									type: 'checkbox',
									name: 'isHome',
									defaultValue: false,
									localized: false,
									unique: false,
									label: {
										de: 'Dies ist die Startseite!',
										en: 'This is the homepage'
									},
									validate: async (val, { data, operation, t, payload }) => await validateIsHome(val, data, payload, t), // return either true or a string error message
								},
								// --- page.useCustomSlug
								{
									type: 'checkbox',
									name: 'useCustomSlug',
									defaultValue: false,
									localized: false,
									label: {
										de: 'URL anpassen',
										en: 'Customize URL'
									},
									admin: {
										condition: (data) => (data.isHome === false && data.editingMode === 'functional') ? true : false,
										/* description: {
											de: 'Die URL wird automatisch aus dem ersten (!) Titel der Website erzeugt. Wenn danach der Titel geändert wird, kann die URL manuell angepasst werden.',
											en: 'By default the URL is generated from the first (!) title of the website.'
										} */
									}
								},
							]
						},
						// --- page.slug
						{
							type: 'text',
							name: 'slug',
							label: {
								de: 'URL Slug',
								en: 'URL Slug'
							},
							unique: false,
							localized: false,
							admin: {
								condition: (data) => (data.isHome === false && data.editingMode === 'functional' && data.useCustomSlug === true) ? true : false,
								/* placeholder: {
									en: 'Leave empty to generate from title',
									de: 'Leer lassen um URL Slug automatisch aus dem Titel zu erzeugen.'
								}, */
								description: {
									en: `ATTENTION: It's important after publishing the website that the URL remains constant.`,
									de: 'ACHTUNG: Nach Veröffentlichung der Website ist es wichtig, dass die URL konstant bleibt.'
								},
							},
							hooks: {
								beforeChange: [
									({ data, value, req, operation, context }) => {
										try {
											const user = req?.user?.shortName ?? 'internal'
											log('--- beforeChange [slug] ---', user, __filename, 7)

											let slug = ''

											if (data.isHome === true) {
												// home
												slug = ''
											} else {
												// not home
												if (value) {
													// has value
													if (data.useCustomSlug === true) {
														// use custom slug
														slug = `${slugify(value)}`
													} else {
														// use former slug
														slug = value
													}
												} else {
													// no value
													if (data.title && data.useCustomSlug === false) {
														// generate slug from title only if empty
														// prevents automatic re-generation of slug when changing the title or the language
														if (typeof data.title === 'object' && Object.keys(data.title).length === 1) {
															// 'title' is a (locale) object and this objects has only one key
															let titleKey = Object.keys(data.title)[0]
															slug = `${slugify(data.title[titleKey])}`
															context.slug = slug
														} else {
															// title is a string 
															slug = `${slugify(data.title)}`
															context.slug = slug
														}
													}
												}

											}

											return slug

										} catch (error) {
											log(error.stack, user, __filename, 3)
										}
									}
								],
							},
						},
						// --- page.url
						{
							type: 'text',
							name: 'url',
							label: {
								de: 'URL',
								en: 'URL'
							},
							unique: false,
							localized: true,
							admin: {
								readOnly: true,
								description: {
									en: '... is generated automatically during the creation of the site from the first title. Later it may be changed via "Additional Options". However this is not recommended after puplication of this page.',
									de: '... wird bei der Erstellung der Website vom ersten gesetzten Titel abgeleitet. Später kann sie über "Zusätzliche Optionen" geändert werden. Es wird jedoch empfohlen die URL nach der Veröffentlichung der Seite konstant zu halten.'
								},
							},
							hooks: {
								beforeChange: [
									async ({ data, req, operation, context }) => {
										try {
											const user = req?.user?.shortName ?? 'internal'
											log('--- beforeChange [url] ---', user, __filename, 7)
											//context.site ??= await getRelatedDoc('sites', data.site, user)
											//const site = context.site
											switch (data.isHome) {
												case true:
													return '/'
												case false:
													if (data.slug || context.slug) {
														return `/${req.locale}/${data.slug || context.slug}`
													} else {
														throw new Error('url not set')
													}
											}
										} catch (error) {
											log(error.stack, user, __filename, 3)
										}
									}
								]
							}
						},
						// --- ADMIN [tab-3] ---
						{
							type: 'collapsible',
							label: 'Admin',
							admin: {
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							fields: [
								// --- page.html
								{
									type: 'group',
									name: 'html',
									access: {
										update: isAdmin,
									},
									fields: [
										// --- page.html.header
										{
											type: 'code',
											name: 'header',
											localized: true,
											admin: {
												language: 'html',
											},
										},
										// --- page.html.head
										{
											type: 'code',
											name: 'head',
											localized: true,
											admin: {
												language: 'html',
											},
										},
										// --- page.html.main
										{
											type: 'code',
											name: 'main',
											localized: true,
											admin: {
												language: 'html',
											},
										},
										// --- page.html.nav
										{
											type: 'code',
											name: 'nav',
											localized: true,
											admin: {
												language: 'html',
											},
										},
									]
								},
								// --- page.assets
								{
									type: 'group',
									name: 'assets',
									access: {
										update: isAdmin,
									},
									fields: [
										// --- page.assets.imgs
										{
											type: 'json',
											name: 'imgs',
											defaultValue: [],
										},
										// --- page.assets.docs
										{
											type: 'json',
											name: 'docs',
											defaultValue: [],
										},
										// --- page.assets.head
										{
											type: 'json',
											name: 'head',
											defaultValue: [],
										},
									]
								}
							]
						},
					]
				},
				// --- ELEMENTS [tab-2]
				{
					label: {
						de: 'Elemente',
						en: 'Elements'
					},
					description: {
						en: 'Here, elements like headers, footers, menus can be associated with this page. These elements may be configured in the menu aside.',
						de: 'Hier werden der Seite Elemente wie Header, Footer, Menü zugeordnet. Diese Elemente können im entsprechnenden Menüpunkt auf der Seitenleiste konfiguriert werden.'
					},
					fields: [
						// --- page.header
						{
							name: 'header',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'headers',
							required: false,
							defaultValue: async ({ user }) => await getDefaultDocID('headers', user.shortName),
						},
						// --- page.nav
						{
							name: 'nav',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'navs',
							required: false,
							defaultValue: async ({ user }) => await getDefaultDocID('navs', user.shortName),
						},
						// --- page.footer
						{
							name: 'footer',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'footers',
							required: false,
							defaultValue: async ({ user }) => await getDefaultDocID('footers', user.shortName),
						},
					]
				},
				// --- CONTENT [tab-3] ---
				{
					name: 'main',
					label: {
						de: 'Inhalt',
						en: 'Content'
					},
					description: 'Wähle die Layout-Elemente, die im Hauptteil (<main>) der Seite verwendet werden sollen.',
					fields: [
						// [layout options]
						{
							type: 'row',
							admin: {
								condition: (data) => (data.editingMode === 'layout') ? true : false,
							},
							fields: [
								// --- page.main.justify
								/* {
									type: 'select',
									name: 'justify',
									label: {
										en: 'Justify horizontally',
										de: 'Horizontale Ausrichtung'
									},
									defaultValue: 'center',
									required: true,
									admin: {
										width: '25%',
										description: {
											en: 'Default setting for all columns',
											de: 'Voreinstellung für alle Spalten'
										}
									},
									options: [
										{
											label: 'Left',
											value: 'left',
										},
										{
											label: 'Center',
											value: 'center',
										},
										{
											label: 'Right',
											value: 'right',
										},
									],
								}, */
								// --- page.main.align
								/* {
									type: 'select',
									name: 'align',
									label: {
										en: 'Align vertically',
										de: 'Vertikale Ausrichtung'
									},
									defaultValue: 'start',
									required: true,
									admin: {
										width: '25%',
									},
									options: [
										{
											label: 'Start',
											value: 'start',
										},
										{
											label: 'Center',
											value: 'center',
										},
										{
											label: 'Baseline',
											value: 'baseline',
										},
										{
											label: 'End',
											value: 'end',
										},
									],
								}, */
								// --- page.main.margin
								/* {
									type: 'select',
									name: 'margin',
									label: {
										en: 'Margin',
										de: 'Rand'
									},
									admin: {
										width: '25%',
									},
									defaultValue: 'medium',
									required: true,
									options: [
										{
											label: {
												en: 'Small',
												de: 'Wenig'
											},
											value: 'small',
										},
										{
											label: {
												en: 'Medium',
												de: 'Mittel'
											},
											value: 'medium',
										},
										{
											label: {
												en: 'Large',
												de: 'Viel'
											},
											value: 'large',
										},
									],
								}, */
								// --- page.main.density
								/* {
									type: 'select',
									name: 'density',
									label: {
										en: 'Density',
										de: 'Dichte'
									},
									required: true,
									admin: {
										width: '25%',
									},
									defaultValue: 'medium',
									options: [
										{
											label: {
												en: 'Small',
												de: 'Wenig'
											},
											value: 'small',
										},
										{
											label: {
												en: 'Medium',
												de: 'Mittel'
											},
											value: 'medium',
										},
										{
											label: {
												en: 'Large',
												de: 'Hoch'
											},
											value: 'high',
										},
									],
								}, */
								// --- page.main.showTitleOnPage
								/* {
									type: 'checkbox',
									name: 'showTitleOnPage',
									label: {
										de: 'Titel oben auf dieser Seite anzeigen',
										en: 'Show title at the top of this page'
									},
									defaultValue: false,
									localized: false,
								}, */
							],
						},
						// --- page.main.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: 'Layout / Posts',
							labels: {
								singular: 'Layout / Post',
								plural: 'Layouts / Posts',
							},
							blocks: [
								//layoutFlex,
								createColumnsFlex(),
								//createColumnsFixed(),
								createIncludePostsBlock(),
							],
						},
					]
				},
			]
		},
		// --- updatedBy
		{
			type: 'text',
			name: 'updatedBy',
			admin: {
				hidden: true
			}
		},
		// --- locale
		{
			type: 'text',
			name: 'locale',
			admin: {
				hidden: true,
				readOnly: true
			}
		},
		// --- SIDEBAR ---
		// --- editingMode
		editingModeField,
		/* {
			type: 'text',
			name: 'preview',
			admin: {
				position: 'sidebar',
				readOnly: true,
			},
			hooks: {
				beforeChange: [
					async ({ data, req, operation, originalDoc, context }) => {
						try {
							const user = req?.user?.shortName ?? 'internal'
							log('--- beforeChange [preview] ---', user, __filename, 7)
	
							if (operation === 'create') {
	
								context.site ??= await getRelatedDoc('sites', data.site, user)
								const site = context.site
								const slug = data.slug ?? originalDoc.slug
								const locale = req.locale
	
								if (slug && locale) {
									return `${site.origin.dev}/${locale}/${slug}`;
								}
								else if (slug) {
									return `${site.origin.dev}/${slug}`;
								}
								else {
									return `${site.origin.dev}`;
								}
							}
						}
						catch (err) {
							log(err.stack, user, __filename, 3)
							mailError(err, req)
						}
					}
				]
			}
		}, */
	],
}

function getHash(params) {
	return crypto.createHash('md5').update(somestring).digest('hex').toString();
}