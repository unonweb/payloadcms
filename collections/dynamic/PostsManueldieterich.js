import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';

/* HOOKS & HELPERS */
import log from '../../customLog';
import getRelatedDoc from '../../hooks/getRelatedDoc';
import iterateBlocks from '../../hooks/iterateBlocks';
import getCol from '../../hooks/_getCol';
import hasChanged from '../../hooks/_hasChanged';
import createElementsFields from './createPageElementsField';
import renderHTMLHead from '../../hooks/renderHTMLHead';
import createAssetsFields from '../../fields/createAssetsFields';
import createHTMLFields from '../../fields/createHTMLFields';
import beforeOperationHook from './beforeOperationHook';
import afterOperationHook from './afterOperationHook';
import afterChangeHook from './afterChangeHook';
import initOtherLocaleField from '../../fields/initOtherLocaleField';
import isAdminOrUserID from '../../access/isAdminOrUserID';

const COLSINGULAR = 'post-manueldieterich'
const COLPLURAL = 'posts-manueldieterich'

export const PostsManueldieterich = {
	slug: 'posts-manueldieterich',
	admin: {
		enableRichTextRelationship: false, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: false,
		useAsTitle: 'id',
		defaultColumns: ['id',],
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
		create: isAdminOrUserID(['65271cdd06dd8e59e067240d']),
		update: isAdminOrUserID(['65271cdd06dd8e59e067240d']),
		read: isAdminOrUserID(['65271cdd06dd8e59e067240d']),
		delete: isAdminOrUserID(['65271cdd06dd8e59e067240d']),
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => beforeOperationHook('posts', { args, operation })
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('--- beforeChange ---', user, __filename, 7)

					context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : null
					context.site ??= await getRelatedDoc('sites', data.site, user)
					const site = context.site

					

					return data

				} catch (err) {
					log(err.stack, user, __filename, 3)
				}
			}
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => afterChangeHook('posts', { req, doc, previousDoc, context, operation })
		],
		afterOperation: [
			async ({ args, operation, result }) => afterOperationHook('posts', { args, operation, result })
		],
	},
	fields: [
		// --- editingMode
		editingModeField,
		initOtherLocaleField,
		// --- post.fields
		{
			type: 'select',
			name: 'fields',
			label: {
				de: 'Elemente',
				en: 'Fields'
			},
			hasMany: true,
			localized: false,
			required: true,
			admin: {
				description: {
					de: 'Bestandteile des Posts',
					en: 'Available fields'
				},
				disableBulkEdit: false,
				position: 'sidebar',
			},
			options: ['title', 'subtitle', 'time', 'date', 'featuredImg', 'description', 'richText', 'location'],
			defaultValue: [],
		},
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
							defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
						},
						// --- post.type
						{
							type: 'relationship',
							relationTo: 'tags',
							name: 'type',
							label: {
								de: 'Typ',
								en: 'Typ'
							},
							filterOptions: () => {
								return {
									relatedCollection: { equals: 'postsFlex' },
								}
							},
							hasMany: false,
							localized: false,
							required: false,
							index: false,
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
						createElementsFields(),
						// post.html
						createHTMLFields(),
						// --- post.assets
						createAssetsFields('imgs', 'docs', 'head'),
						// meta: url
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
							admin: {
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('title')) ? true : false,
							}
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
							admin: {
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('subtitle')) ? true : false,
							}
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
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('description')) ? true : false,
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
									type: 'group',
									name: 'date',
									admin: {
										condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && (data.fields.includes('date') || data.fields.includes('time'))) ? true : false,
									},
									fields: [
										// --- post.date.start
										{
											type: 'date',
											name: 'start',
											label: {
												de: 'Beginn',
												en: 'Start'
											},
											localized: false,
											defaultValue: () => new Date(),
											admin: {
												condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('date')) ? true : false,
												date: {
													pickerAppearance: 'dayOnly',
													displayFormat: 'd.MM.yyyy'
												},
												width: '30%'
											}
										},
										// --- post.date.end
										{
											type: 'date',
											name: 'end',
											label: {
												de: 'Ende',
												en: 'End'
											},
											localized: false,
											defaultValue: () => new Date(),
											admin: {
												condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('dateEnd')) ? true : false,
												date: {
													pickerAppearance: 'dayOnly',
													displayFormat: 'd.MM.yyyy'
												},
												width: '30%'
											}
										},
										// --- post.date.time
										{
											type: 'date',
											name: 'time',
											label: {
												de: 'Uhrzeit',
												en: 'Time'
											},
											localized: false,
											admin: {
												condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('time')) ? true : false,
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
									]
								},
							]
						},
						// --- post.location
						{
							type: 'group',
							name: 'location',
							admin: {
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('location')) ? true : false,
							},
							fields: [
								{
									type: 'row',
									fields: [
										// --- post.location.name
										{
											type: 'text',
											name: 'name',
											label: {
												de: 'Ort',
												en: 'Location'
											},
											required: true,
											localized: true,
											index: true,
											admin: {
												width: '25%',
											}
										},
										// --- post.location.url
										{
											type: 'text',
											name: 'url',
											label: {
												de: 'URL',
												en: 'URL'
											},
											localized: false,
											required: false,
											admin: {
												width: '25%',
												placeholder: 'https://developer.mozilla.org/en-US/',
											},
										},
									]
								},
								// --- post.location.coords
								{
									type: 'point',
									name: 'coords',
									label: {
										de: 'Koordinaten',
										en: 'Coordinates'
									},
									admin: {
										width: '25%',
										hidden: true
									}
								},
							]
						},
						// --- post.featuredImg
						{
							type: 'upload',
							name: 'featuredImg',
							label: {
								en: 'Featured Image',
								de: 'Meta-Bild'
							},
							relationTo: 'images',
							required: false,
							localized: false,
							admin: {
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('featuredImg')) ? true : false,
							}
						},
						// --- richText
						{
							type: 'richText',
							name: 'richText',
							label: 'Rich Text',
							localized: true,
							required: false,
							editor: lexicalEditor({
								features: ({ defaultFeatures }) => [
									...defaultFeatures,
									LinkFeature({
										fields: [
											{
												type: 'checkbox',
												name: 'isDownload',
												label: {
													en: 'Download-Link',
													de: 'Download-Link'
												},
												defaultValue: false,
											},
										],
									}),
									/* UploadFeature({
										collections: {
											uploads: {
												// Example showing how to customize the built-in fields
												// of the Upload feature
												fields: [
													{
														name: 'caption',
														type: 'richText',
														editor: lexicalEditor(),
													},
												],
											},
										},
									}), */
									// This is incredibly powerful. You can re-use your Payload blocks
									// directly in the Lexical editor as follows:
									BlocksFeature({
										blocks: [
											//createImgBlock()
										],
									}),
								]
							}),
							admin: {
								condition: (data, siblingData, { user }) => (Array.isArray(data.fields) && data.fields.includes('richText')) ? true : false,
								description: {
									en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
									de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
								}
							}
						}
					]
				},
			]
		}
	],
}