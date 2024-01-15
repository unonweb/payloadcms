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
import createElementsFields from '../../fields/createPageElementsField';
import cpAssets from '../../hooks/_cpAssets';
import getAppMode from '../../hooks/_getAppMode';
import createAssetsFields from '../../fields/createAssetsFields';
import afterOperationHook from './afterOperationHook';
import beforeOperationHook from './beforeOperationHook';
import afterChangeHook from './afterChangeHook';

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
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => beforeOperationHook('events', { args, operation })
		],
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
			async ({ req, doc, previousDoc, context, operation }) => afterChangeHook('events', { req, doc, previousDoc, context, operation }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => afterOperationHook('events', { args, operation, result })
		],
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
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
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
						createElementsFields(),
						// --- event.assets
						createAssetsFields(),
						// --- event.html
						{
							type: 'code',
							name: 'html',
							localized: true,
							admin: {
								language: 'html',
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							}
						},
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
			]
		}
	],
}