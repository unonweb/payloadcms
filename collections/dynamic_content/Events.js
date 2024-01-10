/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* BLOCKS */
import createRichTextBlock from '../../blocks/rich-text-block';
import createImgBlock from '../../blocks/img-block';

/* HOOKS & HELPERS */
import hasChanged from '../../hooks/_hasChanged';
import iterateBlocks from '../../hooks/iterateBlocks';
import log from '../../customLog';
import getCol from '../../hooks/_getCol';
import updateDocSingle from '../../hooks/updateDocSingle';
import getRelatedDoc from '../../hooks/getRelatedDoc';
import mailError from '../../mailError';
import saveToDisk from '../../hooks/_saveToDisk';
import rmFile from '../../hooks/_rmFile';
import getDoc from '../../hooks/getDoc';
import renderHTMLPage from '../../hooks/renderHTMLPage';
import createPageElementsField from '../../fields/createPageElementsField';
import cpAssets from '../../hooks/_cpAssets';
import getAppMode from '../../hooks/_getAppMode';

export const Events = {
	slug: 'events',
	admin: {
		enableRichTextRelationship: true, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: true,
		useAsTitle: 'title',
		defaultColumns: ['title',],
		description: {
			de: 'Erstelle ein Event. Dieses kann dann auf einer oder mehreren deiner (Sub)Seiten eingebunden werden. Beispiele sind: Veranstaltungen, Termine,...',
			en: 'Create a new post which can then be included in one or multiple of your pages. Examples for posts are: events, appointments,...',
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
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					const mode = getAppMode()
					log('--- beforeChange ---', user, __filename, 7)

					if (data.blocks && data.blocks.length > 0) {
						// && hasChanged(data.blocks, originalDoc?.blocks)
						// data contains the current values
						// originalDoc contains the previous values
						// seems to work with bulk operations, too

						/* iterate blocks */
						context.site ??= await getRelatedDoc('sites', data.site, user)
						const site = context.site

						const images = await getCol('images', user, {
							depth: 0,
							where: {
								sites: { contain: site.id }
							}
						})

						const documents = await getCol('documents', user, {
							depth: 0,
							where: {
								sites: { contain: site.id }
							}
						})

						const pages = await getCol('pages', user, {
							depth: 0,
							where: {
								site: { equals: site.id }
							}
						})

						const { html, imgFiles, docFiles } = iterateBlocks(data, {
							user: user,
							locale: req.locale, // <-- ATT! Really?
							blocks: data.blocks,
							site: site,
							images: images.docs, // collection data
							documents: documents.docs, // collection data
							pages: pages.docs, // collection data
						})

						data.html = html
						data.assets.imgs = imgFiles
						data.assets.docs = docFiles

						return data
					}

				} catch (err) {
					log(err.stack, user, __filename, 3)
				}
			}
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					const mode = getAppMode()
					log('--- afterChange ---', user, __filename, 7)

					context.site ??= await getRelatedDoc('sites', doc.site, user)
					const site = context.site

					/* cp assets */
					await cpAssets(`${process.cwd()}/upload/images/`, `${site.paths.fs.site}/${mode}/assets/imgs`, doc.assets.imgs, user) // cp imgs from src to dest
					await cpAssets(`${process.cwd()}/upload/documents/`, `${site.paths.fs.site}/${mode}/assets/docs`, doc.assets.docs, user) // cp docs from src to dest
					
					/* init other locales */
					if (operation === 'create') {
						if (site.locales.used.length > 1 && site.locales.initOthers === true) {
							for (const loc of site.locales.used) {
								if (loc !== req.locale) {
									const updatedDoc = await updateDocSingle('events', doc.id, user, {
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
						const postHTML = renderHTMLPage(req.locale, doc, user, {
							header: await getDoc('headers', doc.elements.header, user, { depth: 0, locale: req.locale }),
							nav: await getDoc('navs', doc.elements.nav, user, { depth: 0, locale: req.locale }),
							footer: await getDoc('footers', doc.elements.footer, user, { depth: 0, locale: req.locale })
						})

						const destPath = `${site.paths.fs.site}/events/${doc.id}/${req.locale}/index.html` // <-- ATT: hard-coded value
						await saveToDisk(destPath, postHTML, user, { ctParentPath: true })
					}

					/* save collection to disk */
					for (const loc of site.locales.used) {

						const events = await getCol('events', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const eventsWebVersion = createWebVersion(events, req.user)
						const destPath = `${site.paths.fs.events}/${loc}/events.json`
						await saveToDisk(destPath, JSON.stringify(eventsWebVersion), user)
					}

					/* update site.assets.fromPosts */
					if (hasChanged(doc.assets, previousDoc.assets, user)) {
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
						const destPath = `${site.paths.fs.site}/events/${doc.id}/${req.locale}/index.html`
						await rmFile(destPath, user, { recursive: true, throwErrorIfMissing: false })
					}

					/* save collection to disk */
					for (const loc of site.locales.used) {

						const events = await getCol('events', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const webVersion = events.map(doc => {
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

						const destPath = `${site.paths.fs.events}/${loc}/events.json`
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
		]
	},
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
						// --- event.site
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
						// --- event.tags
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
									relatedCollection: { equals: 'events' },
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
						// --- event.title
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
						// --- event.subtitle
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
						// --- event.description
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
						// --- event.date
						{
							type: 'row',
							fields: [
								{
									type: 'date',
									name: 'date',
									label: {
										de: 'Datum (Beginn)',
										en: 'Date (Begin)'
									},
									defaultValue: () => new Date(),
									admin: {
										date: {
											pickerAppearance: 'dayOnly',
											displayFormat: 'd.MM.yyyy'
										},
										width: '30%'
									}
								},
								{
									type: 'date',
									name: 'dateEnd',
									label: {
										de: 'Datum Ende',
										en: 'Date End'
									},
									admin: {
										date: {
											pickerAppearance: 'dayOnly',
											displayFormat: 'd.MM.yyyy'
										},
										width: '30%'
									}
								},
							]
						},
						// --- event.location
						{
							type: 'group',
							name: 'location',
							fields: [
								// --- isOnline
								{
									type: 'checkbox',
									name: 'isOnline',
									label: {
										de: 'Findet online statt',
										en: 'Online event'
									},
									defaultValue: false
								},
								// --- event.location.name
								{
									type: 'text',
									name: 'name',
									admin: {
										condition: (data, siblingData) => (siblingData.isOnline) ? false : true,
									}
								},
								// --- event.location.coords
								{
									type: 'point',
									name: 'coords',
									label: {
										de: 'Koordinaten',
										en: 'Coordinates'
									},
									admin: {
										condition: (data, siblingData) => (siblingData.isOnline) ? false : true,
									}
								},
							]

						},
						// --- event.img
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
						// --- event.hasOwnPage
						{
							type: 'checkbox',
							name: 'hasOwnPage',
							label: {
								de: 'Dieser Artikel hat (zusätzlich) seine eigene Seite/URL.',
								en: 'This article (additionally) has its own page/URL.'
							},
							defaultValue: false,
						},
						// --- event.elements
						// --- event.elements.header
						// --- event.elements.nav
						// --- event.elements.footer
						createPageElementsField(),
					]
				},
				// --- CONTENT [tab-2] ---
				{
					label: 'Content',
					fields: [
						// --- event.blocks
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
				},
				// --- ADMIN [tab-3] ---
				{
					label: 'Admin',
					fields: [
						// --- event.html
						{
							type: 'code',
							name: 'html',
							localized: true,
							admin: {
								language: 'html',
							}
						},
						// --- event.assets
						{
							type: 'group',
							name: 'assets',
							fields: [
								// --- event.assets.imgs
								{
									type: 'json',
									name: 'imgs',
									localized: false,
									defaultValue: [],
								},
								// --- event.assets.docs
								{
									type: 'json',
									name: 'docs',
									localized: false,
									defaultValue: [],
								},
							]
						}
					]
				},
			]
		}
	],
}

function createWebVersion(events = [], user = {}) {

	events = (events.docs) ? events.docs : events
	events = (!Array.isArray(events)) ? [events] : events

	return events.map(doc => {
		return {
			id: doc.id,
			tags: doc.tags,
			title: doc.title,
			time: doc.time,
			html: doc.html,
			author: `${user.firstName} ${user.lastName}`,
			date: doc.date,
			updatedAt: doc.updatedAt,
			createdAt: doc.createdAt,
		}
	})
}