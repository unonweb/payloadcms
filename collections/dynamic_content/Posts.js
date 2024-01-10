/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* BLOCKS */
import createRichTextBlock from '../../blocks/rich-text-block';
import createImgBlock from '../../blocks/img-block';

/* HOOKS & HELPERS */
import log from '../../customLog';
import getDoc from '../../hooks/getDoc';
import getRelatedDoc from '../../hooks/getRelatedDoc';
import mailError from '../../mailError';
import updateDocSingle from '../../hooks/updateDocSingle';
import iterateBlocks from '../../hooks/iterateBlocks';
import getCol from '../../hooks/_getCol';
import saveToDisk from '../../hooks/_saveToDisk';
import cpFile from '../../hooks/_cpFile';
import hasChanged from '../../hooks/_hasChanged';
import createPageElementsField from '../../fields/createPageElementsField';
import renderHTMLPage from '../../hooks/renderHTMLPage';
import renderHTMLHead from '../../hooks/renderHTMLHead';
import rmFile from '../../hooks/_rmFile';
import getUserSites from '../../hooks/getUserSites';
import cpAssets from '../../hooks/_cpAssets';
import getAppMode from '../../hooks/_getAppMode';

export const Posts = {
	slug: 'posts',
	admin: {
		enableRichTextRelationship: true, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: true,
		useAsTitle: 'title',
		defaultColumns: [
			'title',
			'updatedAt',
			'tags'
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
			async ({ args, operation }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					if (args.req.user) {
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
					}
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [posts] "${args.req.context.timeID}"`)
				}
			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('--- beforeChange ---', user, __filename, 7)

					context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : await getRelatedDoc('sites', data.site, user)
					const site = context.site

					if (data.blocks && data.blocks.length > 0) {
						if (!data.html.main || hasChanged(data.blocks, originalDoc?.blocks, user)) {
							// data contains the current values
							// originalDoc contains the previous values
							// seems to work with bulk operations, too

							/* iterate blocks */
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

							data.html.main = html // update post.html.main
							data.assets.imgs = imgFiles // update post.assets.imgs
							data.assets.docs = docFiles // update post.assets.docs

						}
					}

					if (data.hasOwnPage) {
						data.html.head ??= await renderHTMLHead(data, site, user) // create post.html.head
						if (data.description !== originalDoc?.description || data.title !== originalDoc.title) {
							data.html.head = await renderHTMLHead(data, site, user) // update post.html.head
						}
					}

					return data

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
					log('--- afterChange ---', user, __filename, 7)

					context.site ??= await getRelatedDoc('sites', doc.site, user)
					const site = context.site

					if (operation === 'create' && site.locales.used.length > 1 && site.locales.initOthers === true) {
						/* init other locales */
						for (const loc of site.locales.used) {
							if (loc !== req.locale) {
								const updatedDoc = await updateDocSingle('posts', doc.id, user, {
									data: doc,
									locale: loc,
								})
							}
						}
					}

					/* cp assets */
					await cpAssets(`${process.cwd()}/upload/images/`, `${site.paths.fs.site}/${mode}/assets/imgs`, doc.assets.imgs, user) // cp imgs from src to dest
					await cpAssets(`${process.cwd()}/upload/documents/`, `${site.paths.fs.site}/${mode}/assets/docs`, doc.assets.docs, user) // cp docs from src to dest

					/* save this as own page */
					if (doc.hasOwnPage) {
						/* compose html */
						const postHTML = renderHTMLPage(req.locale, doc, user, {
							header: await getDoc('headers', doc.elements.header, user, { depth: 0, locale: req.locale }),
							nav: await getDoc('navs', doc.elements.nav, user, { depth: 0, locale: req.locale }),
							footer: await getDoc('footers', doc.elements.footer, user, { depth: 0, locale: req.locale })
						})

						const destPath = `${site.paths.fs.site}/posts/${doc.id}/${req.locale}/index.html` // <-- ATT: hard-coded value
						await saveToDisk(destPath, postHTML, user, { ctParentPath: true })
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
					const mode = getAppMode()
					context.site ??= await getRelatedDoc('sites', doc.site, user)
					const site = context.site

					/* delete own page */
					if (doc.hasOwnPage) {
						const destPath = `${site.paths.fs.site}/posts/${doc.id}/${req.locale}/index.html`
						await rmFile(destPath, user, { recursive: true, throwErrorIfMissing: false })
					}

					/* save collection to disk */
					for (const loc of site.locales.used) {

						const posts = await getCol('posts', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const webVersion = createWebVersion(posts, req.user)
						const destPath = `${site.paths.fs.site}/${mode}/assets/posts/${loc}/posts.json`
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
			async ({ args, operation, result }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					
					const user = args?.req?.user?.shortName ?? 'internal'
					args.req.context.site ??= await getRelatedDoc('sites', result.site, user)
					const site = args.req.context.site
					/* save all posts to disk */
					for (const loc of site.locales.used) {

						const posts = await getCol('posts', user, {
							depth: 1,
							locale: loc,
							where: {
								site: { equals: site.id }
							},
						})

						const webVersion = createWebVersion(posts, args.req.user)
						const destPath = `${site.paths.fs.posts}/${loc}/posts.json`
						await saveToDisk(destPath, JSON.stringify(webVersion), user)
					}
					console.timeEnd(`<7>[time] [posts] "${args.req.context.timeID}"`)
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
						// --- post.site
						{
							type: 'relationship',
							name: 'site',
							relationTo: 'sites',
							hasMany: false,
							index: true,
							required: true,
							maxDepth: 0, // if 1 then for every post the corresponding site is included into the pages collection (surplus data)
							defaultValue: ({ user }) => { // If user is not admin, set the site by default to the first site that they have access to
								if (!user.roles.includes('admin') && user.sites?.[0]) {
									return user.sites[0]
								}
							}
						},
						// --- post.tags
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
									relatedCollection: { equals: 'posts' },
								}
							},
							hasMany: true,
							localized: false,
							required: true,
							index: true,
							maxDepth: 1,
							// * if set to 1 then bulk operations include the entire doc in 'originalDoc'
							// * if changed renderHTMLFromBlocks has to be changed, too
							admin: {
								description: {
									de: 'Ein Posts kann mithilfe von Tagsn in eine oder mehrere deiner Sub(Seiten) eingebunden werden.',
									en: 'By the means of tags a post may be included in one or multiple pages.'
								},
								disableBulkEdit: false, // must be disabled if updatePostCategories() is used
							},
							/* hooks: {
								afterChange: [
									async (args) => {
										try {
											//await updatePostCategories(args)
										} catch (err) {
											reportError(err, args.req)
										}
									},
								]
							} */
						},
						// --- post.title
						{
							type: 'text',
							name: 'title',
							label: {
								de: 'Titel',
								en: 'Title'
							},
							required: true,
							localized: true,
							index: true,
						},
						// --- post.subtitle
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
						// --- post.description
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
						{
							type: 'row',
							fields: [
								// --- post.date
								{
									type: 'date',
									name: 'date',
									label: {
										de: 'Datum (Beginn)',
										en: 'Date (Begin)'
									},
									localized: false,
									defaultValue: () => new Date(),
									admin: {
										date: {
											pickerAppearance: 'dayOnly',
											displayFormat: 'd.MM.yyyy'
										},
										width: '30%'
									}
								},
								// --- post.time
								{
									type: 'date',
									name: 'time',
									label: {
										de: 'Uhrzeit',
										en: 'Time'
									},
									localized: false,
									admin: {
										date: {
											pickerAppearance: 'timeOnly',
											timeIntervals: '15',
											timeFormat: 'hh:mm'
										},
										width: '30%',
										placeholder: '00:00',
									},
									defaultValue: () => new Date(),
								},
								/* {
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
								}, */
							]
						},
						// --- post.img
						{
							type: 'upload',
							name: 'img',
							label: {
								en: 'Featured Image',
								de: 'Meta-Bild'
							},
							relationTo: 'images',
							required: false,
							localized: false,
						},
						// --- post.hasOwnPage
						{
							type: 'checkbox',
							name: 'hasOwnPage',
							label: {
								de: 'Dieser Post bekommt seine eigene Seite/URL.',
								en: 'This post gets its own page/URL.'
							},
							defaultValue: false,
							localized: false,
						},
						// --- post.elements
						// --- post.elements.header
						// --- post.elements.nav
						// --- post.elements.footer
						createPageElementsField(),

						// meta: url
						/* {
							type: 'text',
							name: 'url',
							label: {
								de: 'Post URL',
								en: 'Post URL'
							},
							localized: false,
							required: false,
							admin: {
								readOnly: true,
							},
							hooks: {
								afterRead: [
									(args) => addURLSlug(args) // <-- CHECK: unsure if I need this. Maybe I just link to posts via ID?
								]
							},
						}, */
						// --- meta: slug
						/* {
							type: 'text',
							name: 'slug',
							label: {
								de: 'Post Slug',
								en: 'Post Slug'
							},
							localized: false,
							required: false,
							admin: {
								readOnly: true,
							},
							hooks: {
								afterRead: [
									(args) => addSlug(args) // <-- CHECK: unsure if I need this. Maybe I just link to posts via ID?
								]
							},
						}, */
						// --- preview select ---
						/* {
							type: 'group',
							name: 'preview',
							label: {
								de: 'Vorschau',
								en: 'Preview'
							},
							fields: [
								{
									type: 'checkbox',
									name: 'usePreview',
									label: {
										de: 'Vorschau aktivieren',
										en: 'Activate Preview'
									},
								},
								{
									type: 'row',
									fields: [
										{
											type: 'checkbox',
											name: 'img',
											label: {
												de: 'Bild',
												en: 'Image'
											},
											admin: {
												width: '25%',
												condition: (_, siblingData) => siblingData?.usePreview
											}
										},
										{
											type: 'checkbox',
											name: 'title',
											label: {
												de: 'Titel',
												en: 'Preview Image'
											},
											admin: {
												width: '25%',
												condition: (_, siblingData) => siblingData?.usePreview
											}
										},
										{
											type: 'checkbox',
											name: 'excerpt',
											label: {
												de: 'Exzerpt',
												en: 'Excerpt'
											},
											admin: {
												width: '25%',
												condition: (_, siblingData) => siblingData?.usePreview
											}
										},
										{
											type: 'checkbox',
											name: 'date',
											label: {
												de: 'Datum',
												en: 'Date'
											},
											admin: {
												width: '25%',
												condition: (_, siblingData) => siblingData?.usePreview
											}
										},
									]
								},
								// --- preview img ---
								{
									type: 'upload',
									name: 'img',
									relationTo: 'images',
									required: true,
									admin: {
										description: {
											en: 'Preview Image',
											de: 'Vorschau-Bild'
										},
										condition: (_, siblingData) => siblingData?.img
									}
								},
							]
						} */


					]
				},
				// --- CONTENT [tab-2] ---
				{
					label: {
						de: 'Inhalt',
						en: 'Content'
					},
					description: 'Wähle die Elemente des Blog-Posts.',
					fields: [
						// --- post.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								en: 'Content',
								de: 'Inhalt'
							},
							labels: {
								singular: 'Contents',
								plural: 'Inhalte',
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
						// --- post.html
						{
							type: 'group',
							name: 'html',
							fields: [
								// --- post.html.main
								{
									type: 'code',
									name: 'main',
									localized: true,
									admin: {
										language: 'html',
									}
								},
								// --- post.html.head
								{
									type: 'code',
									name: 'head',
									localized: true,
									admin: {
										language: 'html',
									}
								},
							]
						},
						// --- post.assets
						{
							type: 'group',
							name: 'assets',
							fields: [
								// --- post.assets.imgs
								{
									type: 'json',
									name: 'imgs',
									defaultValue: [],
									localized: false,
								},
								// --- post.assets.docs
								{
									type: 'json',
									name: 'docs',
									defaultValue: [],
									localized: false,
								},
							]
						}
					]
				},
			]
		}
	],
}

function addSlug(args) {
	// afterRead 
	// field hook

	try {
		if (args.data.title) {
			return `${slugify(args.data.title)}`
		} else {
			return args.value
			//throw ReferenceError('args.data.title not set.')
		}
	} catch (error) {
		console.error(error)
	}
}

function addURLSlug(args) {
	// field hook
	// beforeValidate
	try {
		if (args.data.title) {
			return `/posts/${slugify(args.data.title)}`
		} else {
			return args.value
			//throw ReferenceError('args.data.title not set.')
		}
	} catch (error) {
		console.error(error)
	}
}

function slugify(str) {
	str = str.replace(/^\s+|\s+$/g, '');

	// Make the string lowercase
	str = str.toLowerCase();

	// Remove accents, swap ñ for n, etc
	var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
	var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	// Remove invalid chars
	str = str.replace(/[^a-z0-9 -]/g, '')
		// Collapse whitespace and replace by -
		.replace(/\s+/g, '-')
		// Collapse dashes
		.replace(/-+/g, '-');

	return str;
}

async function getAffectedPageIDs(doc, user) {
	/* mechanism:
	 1. A post is associated with one or more post-categories [ 'blog', 'publications' ]
	 2. A page includes one or more post-categories with the 'includePosts' block
		  - When doing so a reference to that page is saved in the corresponding post-categories in the 'relPages' field
	 3. After changing a post, that post queries its associated categories in order to get the affected pages 
	*/

	let affectedPageIDs = []

	for (let i = 0; i < meta.tags.length; i++) {
		// go through all categories associated with this post

		if (typeof doc.tags[i] === 'string') {
			doc.tags[i] = await getDoc('posts-categories', doc.tags[i], user) // get full post-categories relationship data
		}

		for (const relPageID of doc.tags[i].relPages) {
			// go through related Pages within each postCategory
			if (!affectedPageIDs.includes(relPageID)) {
				affectedPageIDs.push(relPageID) // add pageID if it's not in the array yet
			}
		}

	}

	return affectedPageIDs
}

async function addFullRelationshipData(doc = {}, relField = '', destCol = '', locale = '', user = '') {

	for (let i = 0; i < doc[relField].length; i++) {
		// go through all categories associated with this post
		if (typeof doc[relField][i] === 'string') {
			doc[relField][i] = await getDoc(destCol, doc[relField][i], user, { locale: locale }) // get full relationship data
		}
	}

	return doc
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