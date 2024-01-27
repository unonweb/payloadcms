/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* BLOCKS */
import createRichTextBlock from '../../blocks/rich-text-block';
import createImgBlock from '../../blocks/img-block';

/* HOOKS & HELPERS */
import createElementsFields from './createPageElementsField';
import createAssetsFields from '../../fields/createAssetsFields';
import afterOperationHook from './afterOperationHook';
import beforeOperationHook from './beforeOperationHook';
import afterChangeHook from './afterChangeHook';
import initOtherLocaleField from '../../fields/initOtherLocaleField';
import beforeChangeHook from './beforeChangeHook';

const SLUG = 'events'
const COLSINGULAR = 'event'

export const Events = {
	slug: SLUG,
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
		//hidden: ({ user}) => ['hhaerer'].includes(user.shortName)
		hidden: true,
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
			async ({ args, operation }) => beforeOperationHook(SLUG, { args, operation })
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => beforeChangeHook(SLUG, { data, req, operation, originalDoc, context })
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => afterChangeHook(SLUG, { req, doc, previousDoc, context, operation }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => afterOperationHook(SLUG, { args, operation, result })
		],
	},
	fields: [
		// --- editingMode
		editingModeField,
		initOtherLocaleField,
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
						// --- event.header
						// --- event.nav
						// --- event.footer
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