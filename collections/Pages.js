import * as React from "react";

/* ACCESS */
import { isLoggedIn } from '../access/isLoggedIn.js';
import hasSiteAccess from '../access/hasSiteAccess.js';

/* FIELDS */
import createCommonFields from '../fields/createCommonFields.js';
import createHTMLFields from '../fields/createHTMLFields.js';
import otherLocaleField from '../fields/otherLocaleField.js';
import { deployButtonField } from '../fields/deployButtonField.js';

/* BLOCKS */
import createColumnsFlex from '../blocks/layout/lay-flex.js';

/* HOOKS & HELPERS */
import getRelatedDoc from '../hooks/getRelatedDoc.js';
import validateIsHome from '../hooks/validate/validateIsHome.js';
import log from '../helpers/customLog.js';
import mailError from '../helpers/mailError.js';
import updateDocSingle from '../hooks/updateDocSingle.js';
import validatePageTitle from '../hooks/validate/validatePageTitle.js';
import slugify from '../helpers/_slugify.js';
import canAccess from '../helpers/_canAccess.js';
import createAssetsFields from '../fields/createAssetsFields.js';
import resetBrokenRelationship from '../hooks/beforeValidate/resetBrokenRelationship.js';
import getDefaultDocID from '../hooks/beforeValidate/getDefaultDocID.js';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime.js';
import populateContextBeforeOp from '../hooks/beforeOperation/populateContext.js';
import endConsoleTime from '../hooks/afterOperation/endConsoleTime.js';
import setMainHTML from '../hooks/beforeChange/setMainHTML.js';
import setHeadHTML from '../hooks/beforeChange/setHeadHTML.js';
import populateContextBeforeVal from '../hooks/beforeValidate/populateContext.js';
import copyAssets from '../hooks/afterChange/copyAssets.js';
import setPageHTML from '../hooks/beforeChange/setPageHTML.js';
import savePage from '../hooks/afterChange/savePage.js';
import removePrevPage from '../hooks/afterChange/removePrevPage.js';
import requestUpdateByID from '../helpers/requestUpdateByID.js';
import isUnique from '../hooks/validate/isUnique.js';

const commonFields = createCommonFields()
const SLUG = 'pages'

export const Pages = {
	slug: SLUG,
	admin: {
		useAsTitle: 'title',
		defaultColumns: [
			'title',
			'updatedAt',
			'isHome'
		],
		listSearchableFields: ['title'], // make sure you index each of these fields so your admin queries can remain performant.
		description: () => {
			//`Here, you may create new (sub)-pages. After creation, go to "Elements" > "Navigation" in order to link them to your page navgiation.`
			// <code>Elemente</code> &#10141; <code>Navigation</code>
			return (
				<span>Hier können neue (Sub-)Seiten erstellt werden.<br></br>Damit diese im Menü der Website auftauchen, müssen sie in unter <u><a href="/admin/collections/navs" target="_self">Navigation</a></u> verlinkt werden.</span>
			)
		},
		group: {
			de: 'Pages',
			en: 'Pages'
		},
		enableRichTextRelationship: false, // <-- IMP: enable
		enableRichTextLink: true,
		hideAPIURL: true,
		pagination: {
			defaultLimit: 30,
		},
	},
	versions: false,
	access: {
		create: isLoggedIn,
		update: hasSiteAccess('site'),
		read: hasSiteAccess('site'),
		delete: hasSiteAccess('site'),
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => await startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		beforeValidate: [
			async ({ data, req, operation, originalDoc }) => await populateContextBeforeVal({ data, req }, ['sites', 'images', 'documents', 'pages'])
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setMainHTML({ data, req, operation, originalDoc, context }), // data.html.main, data.assets
			async ({ data, req, operation, originalDoc, context }) => await setHeadHTML({ data, req, context }), // data.html.head
			async ({ data, req, operation, originalDoc, context }) => await setPageHTML({ data, req, operation, originalDoc, context }), // data.html.main 
		],
		// --- afterChange 
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => await copyAssets(['images', 'documents', 'head'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, context, operation }) => await savePage({ doc, req, context }),
			async ({ req, doc, previousDoc, context, operation }) => await removePrevPage({ doc, previousDoc, req, context }),
			async ({ req, doc, previousDoc, operation, context }) => {
				try {
					const pathSite = context.pathSite

					/* request site update */
					if (!await canAccess(`${pathSite}/assets/fonts.css`)) {
						requestUpdateByID(context, {
							src: 'pages',
							dest: 'sites',
							id: context.site.id,
							reason: `Can't access font.css`
						})
					}

					if (!await canAccess(`${pathSite}/assets/user.css`)) {
						requestUpdateByID(context, {
							src: 'pages',
							dest: 'sites',
							id: context.site.id,
							reason: `Can't access user.css`
						})
					}

					/*  update site */
					if (context.requestUpdate) {

						for (let slug of Object.keys(context.requestUpdate)) {
							for (let id of Object.keys(context.requestUpdate[slug])) {
								await updateDocSingle(slug, id, context.user, {
									data: context.requestUpdate[slug][id],
									context: {
										isUpdatedByCode: true,
										updatedBy: 'pages',
										...context,
									},
									overrideAccess: false,
									user: req.user,
								})
							}
						}
					}

				} catch (err) {
					log(err.stack, context.user, __filename, 3)
					mailError(err)
				}
			},
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
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
							defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : null,
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
						//	not used currently
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
								description: {
									de: 'Optional. Hilft den Überblick zu behalten.',
									en: 'Optional. Helps to sort pages in the admin panel.'
								},
								hidden: true
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
										condition: (data) => (data.isHome === false) ? true : false,
									},
									hooks: {
										beforeChange: [
											() => false // always reset
										],
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
								condition: (data) => (!data.isHome && data.useCustomSlug) ? true : false,
								description: {
									en: `ATTENTION: It's important after publishing the website that the URL remains constant.`,
									de: 'ACHTUNG: Nach Veröffentlichung der Website ist es wichtig, dass die URL konstant bleibt.'
								},
								disableBulkEdit: true,
							},
							hooks: {
								beforeValidate: [
									({ data, value, req, operation, context }) => {
										try {
											/* 
												Task:
													Set and retun slug
												Arguments:
													- 'value' is undefined in bulk operations
											*/
											if (!req.user) return
											if (operation === 'update' && value === undefined) return // skip bulk ops
											if (data.isHome) return ''
											
											if (value) return slugify(value)

											if (!value) {
												// no value (if page.slug field has been emptied in the admin panel)
												// generate slug from title only if empty
												// prevents automatic re-generation of slug when changing the title or the language
												if (typeof data.title === 'string') {
													return slugify(data.title)
												}

												if (typeof data.title === 'object') {
													// 'title' is a (locale) object and this objects has only one key
													let titleKey = Object.keys(data.title)[0]
													return slugify(data.title[titleKey])
												}
											}
										} catch (error) {
											log(error.stack, context.user, __filename, 3)
										}
									}
								],
							},
							validate: async (val, { data, operation, t, payload }) => (!data.isHome && val === '') ? 'Bitte Wert angeben oder "ULR anpassen" deaktivieren' : true
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
									en: '... is generated automatically during the creation of the site from the first title. Later it may only be changed via "Functional Options". However this is not recommended after puplication of this page.',
									de: '... wird bei der Erstellung der Website vom ersten Titel abgeleitet. Später kann die URL nur über "Funktionale Optionen" geändert werden. Es wird jedoch empfohlen die URL nach der Veröffentlichung der Seite konstant zu halten.'
								},
								disableBulkEdit: true,
							},
							validate: async (val, { data, operation, t, payload }) => await isUnique(SLUG, 'url', val, { data, payload }),
							hooks: {
								beforeChange: [
									async ({ data, req, operation, context, value, previousValue }) => {
										try {
											/* 
												Task:
													Compose and return url
												Arguments:
													'data.slug' has the current value given in the admin panel
												Attention:
													If value of data.slug is changed a beforeChange field hook this change will not be visible here.
													But if data.slug is changed in a beforeValidate hook we can see it here
											*/
											if (!req.user) return
											if (data.isHome) return '/'

											if (data.slug) return `/${req.locale}/${data.slug}`
											else throw new Error('url not set')

										} catch (error) {
											log(error.stack, context.user, __filename, 3)
										}
									}
								],
								afterChange: [
									
								]
							}
						},
						// --- page.html
						createHTMLFields('head', 'main', 'page'),
						// --- page.assets
						// --- page.assets.imgs
						// --- page.assets.docs
						// --- page.assets.head
						createAssetsFields('imgs', 'docs', 'head', 'otherURLs'),
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
						{
							type: 'row',
							fields: [
								// --- element.useHeader
								{
									type: 'checkbox',
									name: 'useHeader',
									label: {
										de: 'Verwende Header',
										en: 'Use Header'
									},
									defaultValue: true,
									admin: {
										width: '25%'
									}
								},
								// --- element.useNav
								{
									type: 'checkbox',
									name: 'useNav',
									label: {
										de: 'Verwende Navigation',
										en: 'Use Navigation'
									},
									defaultValue: true,
									admin: {
										width: '25%'
									}
								},
								// --- element.useFooter
								{
									type: 'checkbox',
									name: 'useFooter',
									label: {
										de: 'Verwende Footer',
										en: 'Use Footer'
									},
									defaultValue: true,
									admin: {
										width: '25%'
									}
								},
							]
						},
						// --- page.header
						{
							name: 'header',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'headers',
							filterOptions: ({ data }) => {
								return {
									site: { equals: data.site }, // only elements associated with this site
								}
							},
							required: false,
							admin: {
								condition: (data, siblingData) => (siblingData && siblingData.useHeader) ? true : false,
							},
							hooks: {
								beforeValidate: [
									async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
										// return null if field is hidden by condition
										if (siblingData && !siblingData.useHeader) return null

										const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

										if (!fieldValue) {
											return await getDefaultDocID({ data, originalDoc, value, field, context, req })
										}
										else {
											return await resetBrokenRelationship(fieldValue, { field, context, collection })
										}
									},
								]
							}
						},
						// --- page.nav
						{
							name: 'nav',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'navs',
							filterOptions: ({ data }) => {
								return {
									site: { equals: data.site }, // only elements associated with this site
								}
							},
							required: false,
							admin: {
								condition: (data, siblingData, { user }) => (siblingData && siblingData.useNav) ? true : false,
							},
							hooks: {
								beforeValidate: [
									async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
										// return null if field is hidden by condition
										if (siblingData && !siblingData.useNav) return null

										const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

										if (!fieldValue) {
											return await getDefaultDocID({ data, originalDoc, value, field, context, req })
										}
										else {
											return await resetBrokenRelationship(fieldValue, { field, context, collection })
										}
									}
								]
							}
						},
						// --- page.footer
						{
							name: 'footer',
							type: 'relationship',
							maxDepth: 0, // only return id
							relationTo: 'footers',
							filterOptions: ({ data }) => {
								return {
									site: { equals: data.site }, // only elements associated with this site
								}
							},
							required: false,
							admin: {
								condition: (data, siblingData, { user }) => (siblingData && siblingData.useFooter) ? true : false,
							},
							hooks: {
								beforeValidate: [
									async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
										// return null if field is hidden by condition
										if (siblingData && !siblingData.useFooter) return null

										const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

										if (!fieldValue) {
											return await getDefaultDocID({ data, originalDoc, value, field, context, req })
										}
										else {
											return await resetBrokenRelationship(fieldValue, { field, context, collection })
										}
									}
								]
							}
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
						// --- page.main.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: 'Layout',
							labels: {
								singular: 'Layout',
								plural: 'Layouts',
							},
							blocks: [
								createColumnsFlex(),
								//createLayoutTemplate(),
							],
							defaultValue: [
								{
									blockType: 'columns-flex'
								}
							],
						},
					]
				},
			]
		},
		...commonFields,
		// --- SIDEBAR ---
		otherLocaleField,
		deployButtonField,
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