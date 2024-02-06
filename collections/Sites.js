/* ACCESS */
import { isAdmin } from '../access/isAdmin.js';
import log from '../helpers/customLog.js';

/* FIELDS */
import colorPickerField from '../components/color-picker-field.js';

/*  HOOKS & HELPERS */
import mailError from '../helpers/mailError.js';
import rmDocs from '../helpers/rmDocs.js';
import rmFile from '../helpers/_rmFile.js';
import resolveObjPath from '../helpers/_resolveObjPath.js';
import getRandomDocID from '../hooks/getRandomDocID.js';
import getRelatedDoc from '../hooks/getRelatedDoc.js';
import saveToDisk from '../helpers/_saveToDisk.js';
import CSSFromJSON from '../helpers/CSSFromJSON.js';
import canAccess from '../helpers/_canAccess.js';
import updateDocsMany from '../hooks/updateDocsMany.js';
import CSSObjUpdate from '../helpers/CSSObjUpdate.js';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime.js';
import endConsoleTime from '../hooks/afterOperation/endConsoleTime.js';
import CSSObjRemoveKey from '../helpers/CSSObjRemoveKey.js';
import copyAssets from '../hooks/afterChange/copyAssets.js';
import setSiteDefaults from '../hooks/beforeValidate/setSiteDefaults.js';
import initFSPaths from '../hooks/afterChange/initFSPaths.js';
import populateContextBeforeOp from '../hooks/beforeOperation/populateContext.js';
import populateContextBeforeVal from '../hooks/beforeValidate/populateContext.js';

const defaultUserCSS = {
	"html": {
		"--primary": "#8ff0a4",
		"--triad-1": "color-mix(in oklch longer hue, var(--primary) 33%, var(--primary-clone))",
		"--triad-2": "color-mix(in oklch longer hue, var(--primary) 66%, var(--primary-clone))",
		"--secondary": "#f9f06b",
		"--analogous-1": "color-mix(in oklch longer hue, var(--primary) 20%, var(--primary-clone))",
		"--analogous-2": "color-mix(in oklch longer hue, var(--primary) 10%, var(--primary-clone))",
		"--analogous-3": "color-mix(in oklch longer hue, var(--primary), var(--primary-clone) 10%)",
		"--analogous-4": "color-mix(in oklch longer hue, var(--primary), var(--primary-clone) 20%)",
		"--primary-clone": "color-mix(in oklch, var(--primary), white 0.001%)",
		"--complementary": "color-mix(in oklch longer hue, var(--primary), var(--primary-clone))",
		"--split-complementary-1": "color-mix(in oklch longer hue, var(--primary) 41.666%, var(--primary-clone))",
		"--split-complementary-2": "color-mix(in oklch longer hue, var(--primary) 58.333%, var(--primary-clone))"
	}
}

const SLUG = 'sites'

export const Sites = {
	slug: 'sites',
	labels: {
		singular: {
			de: 'Site / Domain',
			en: 'Site / Domain'
		},
		plural: {
			de: 'Sites / Domains',
			en: 'Sites / Domains'
		}
	},
	admin: {
		useAsTitle: 'domain',
		group: {
			de: 'Admin',
			en: 'Admin'
		},
		description: {
			de: 'Hier befinden sich Einstellungen für die gesamte Website (identifiziert durch die Domain).',
			en: 'Here you can find settings for the overall website (identified by the domain).'
		},
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	// --- access
	access: {
		create: isAdmin,
		read: ({ req: { user } }) => {
			// is admin or is associated with this site
			if (user) {
				if (user.roles.includes('admin')) {
					return true
				}
				if (user.roles.includes('editor') && user.sites?.length > 0) {
					return { id: { in: user.sites } } // return a query constraint which limits the documents that are returned to only those that match the constraint you provide.
				}
			} else {
				return false
			}
		},
		update: ({ req: { user } }) => {
			// is admin or is associated with this site
			if (user) {
				if (user.roles.includes('admin')) {
					return true
				}
				if (user.roles.includes('editor') && user.sites?.length > 0) {
					return { id: { in: user.sites } }
				}
			} else {
				return false
			}
		},
		delete: isAdmin,
	},
	//--- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => await startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		// --- beforeValidate
		beforeValidate: [
			// runs after client-side validation
			// runs before server-side validation
			async ({ data, req, operation, originalDoc, context }) => await populateContextBeforeVal({ data, req, originalDoc }, ['sites', 'images', 'documents', 'pages']),
			async ({ data, req, operation, originalDoc }) => setSiteDefaults({ data, operation }),
		],
		// --- beforeChange
		beforeChange: [],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => await copyAssets(['images', 'documents', 'fonts'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, context, operation }) => await initFSPaths({ req, doc, operation, previousDoc, context }),
			async ({ req, doc, operation, previousDoc, context }) => {
				try {
					const user = context.user
					const pathSite = context.pathSite
					const mode = context.mode

					/* write font.css */
					if (mode === 'dev' || doc?.fonts?.css !== previousDoc?.fonts?.css || !await canAccess(`${pathSite}/assets/fonts.css`)) {
						saveToDisk(`${pathSite}/assets/fonts.css`, doc.fonts.css, user)
					}

					/* write user.css */
					if (mode === 'dev' || JSON.stringify(doc?.css) !== JSON.stringify(previousDoc?.css) || !await canAccess(`${pathSite}/assets/user.css`)) {
						let userCSS = CSSFromJSON(doc.css)
						await saveToDisk(`${pathSite}/assets/user.css`, userCSS, user)
					}

					/* update site.assets.imgs */
					doc.assets.imgs = []
					if (doc.background.img_filename) {
						doc.assets.imgs.push(doc.background.img_filename)	
					}

					/* update pages */
					if (!context.isUpdatedByCode && context.updatePages) {
						for (const loc of doc.locales.used) {
							await updateDocsMany('pages', user, {
								where: {
									site: { equals: doc.id }
								},
								data: { updatedBy: `sites-${Date.now()}` },
								depth: 0,
								locale: loc,
								context: {
									site: doc,
									...context,
								}
							})
						}
					}

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			},
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, id, doc, context }) => {
				try {
					const user = context.user
					log(`--- afterDelete ---`, user, __filename, 7)
					context.siteIsDeleted = true

					const rmSiteFiles = true
					const rmPagesData = true
					const rmPostsData = true
					const rmHeadersData = true
					const rmNavsData = true
					const rmFootersData = true

					// remove site files
					if (rmSiteFiles) {
						const pathSite = doc.paths.fs.site
						await rmFile(pathSite, user, { recursive: true, force: true })
					}
					// remove 'Pages' Data
					if (rmPagesData) {
						await rmDocs('pages', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Posts-Flex' Data
					if (rmPostsData) {
						await rmDocs('posts-flex', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Headers' Data
					if (rmHeadersData) {
						await rmDocs('headers', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Nav' Data
					if (rmNavsData) {
						await rmDocs('navs', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Footers' Data
					if (rmFootersData) {
						await rmDocs('footers', user, {
							where: { site: { equals: id } }
						})
					}

					return context

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			}
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
						// --- site.domain
						{
							type: 'text',
							name: 'domain',
							required: false,
							unique: true,
							admin: {
								placeholder: 'yourdomain.de',
							},
							index: true,
							validate: (value, { operation }) => {

								let response

								// client-side validation
								if (operation === 'create') {
									response = (isValidDomain(value)) ? true : 'This is not a valid domain name!'
								}
								else {
									response = true
								}

								return response
							},
						},
						// --- site.domainShort
						{
							type: 'text',
							name: 'domainShort',
							required: false,
							validate: (value, { payload }) => exists(value, payload),
							admin: {
								readOnly: true,
							},
						},
						// --- site.brandName
						{
							type: 'text',
							name: 'brandName',
							required: false,
							validate: (value, { payload }) => exists(value, payload),
						},
						// --- site.assets
						{
							type: 'group',
							name: 'assets',
							admin: {
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							fields: [
								// --- site.assets.fonts
								// 	* updated in beforeChange
								//	* required for cleanUpSite()
								{
									type: 'json',
									name: 'fonts',
									label: 'site.assets.fonts',
									defaultValue: [],
									hooks: {
										beforeChange: [
											async ({ value, data, context, req }) => {

												if (!req.user) return // return in bulk ops (we've disableBulkEdit)

												value = []
												context.fonts ??= {}

												if (data.fonts.body) {
													context.fonts.body ??= await getRelatedDoc('fonts', data.fonts.body, context.user, { depth: 0 })
													value.push(context.fonts.body.filename)
												}
												if (data.fonts.headings) {
													context.fonts.headings ??= await getRelatedDoc('fonts', data.fonts.headings, context.user, { depth: 0 })
													value.push(context.fonts.headings.filename)
												}

												return value
											}
										]
									}
								},
								// --- site.assets.imgs
								// 	* updated in beforeChange
								//	* required for cleanUpSite()
								{
									type: 'json',
									name: 'imgs',
									label: 'site.assets.imgs',
									defaultValue: [],
								},
							]
						},
						// --- site.paths
						{
							type: 'group',
							name: 'paths',
							admin: {
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							fields: [
								// --- site.paths.web
								{
									type: 'group',
									name: 'web',
									label: {
										de: 'Web',
										en: 'Web'
									},
									fields: [
										// --- site.paths.web.origin
										{
											type: 'group',
											name: 'origin',
											label: 'site.paths.web.origin',
											fields: [
												// --- site.paths.web.origin.dev
												//  * used for hreflang
												{
													type: 'text',
													name: 'dev',
													label: 'site.paths.web.origin.dev',
													required: false,
													admin: {
														placeholder: 'http://localhost:8003',
														description: 'No trailing slash!'
													},
													validate: (value, { payload }) => exists(value, payload)
												},
												// --- site.paths.web.origin.prod
												//  * used for hreflang
												{
													type: 'text',
													name: 'prod',
													label: 'site.paths.web.origin.prod',
													required: false,
													admin: {
														placeholder: 'https://<domain>.de',
														description: 'No trailing slash!'
													},
													validate: (value, { payload }) => exists(value, payload),
												},
											]
										},
										// --- site.paths.web.admin
										{
											type: 'group',
											name: 'admin',
											fields: [
												// --- site.paths.web.admin.resources
												{
													type: 'text',
													name: 'resources',
													label: 'site.paths.web.admin.resources',
													required: false,
													saveToJWT: true,
													defaultValue: 'https://resources.unonweb.local',
													admin: {
														placeholder: 'https://resources.unonweb.local',
														readOnly: true,
														description: 'This value is set by afterChange by Admin Global.'
													},
												},
											]
										}
									]
								},
								// --- site.paths.fs
								{
									type: 'group',
									name: 'fs',
									label: {
										en: 'Filesystem',
										de: 'Dateisystem',
									},
									fields: [
										// --- site.paths.fs.site
										{
											type: 'text',
											name: 'site',
											label: 'site.paths.fs.site',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>',
												readOnly: true,
												description: 'This value is set afterChange by Admin Global. If changed all path fields are recreated.'
											},
										},
										// --- site.paths.fs.imgs
										// --- not used any more
										{
											type: 'text',
											name: 'imgs',
											label: 'site.paths.fs.imgs',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/imgs'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
										},
										// --- site.paths.fs.fonts
										{
											type: 'text',
											name: 'fonts',
											label: 'site.paths.fs.fonts',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
										},
										// --- site.paths.fs.docs
										{
											type: 'text',
											name: 'docs',
											label: 'site.paths.fs.docs',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/docs'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
										},
										// --- group: admin
										{
											type: 'group',
											name: 'admin',
											fields: [
												// --- site.paths.fs.admin.sites
												{
													type: 'text',
													name: 'sites',
													label: 'site.paths.fs.admin.sites',
													required: false,
													defaultValue: '/home/payload/sites',
													admin: {
														placeholder: `/home/payload/sites`,
														readOnly: true,
														description: 'This value is set by afterChange by Admin Global. If changed all path fields are recreated.'
													},
												},
												// --- site.paths.fs.admin.resources
												{
													type: 'text',
													name: 'resources',
													label: 'site.paths.fs.admin.resources',
													required: false,
													defaultValue: '/srv/web/resources',
													admin: {
														placeholder: `/srv/web/resources`,
														readOnly: true,
														description: 'This value is set by afterChange by Admin Global.'
													},
												},
												// --- site.paths.fs.admin.customElements
												{
													type: 'text',
													name: 'customElements',
													label: 'site.paths.fs.admin.customElements',
													required: false,
													defaultValue: '/srv/web/resources/custom-elements',
													admin: {
														placeholder: `/srv/web/resources/custom-elements`,
														readOnly: true,
														description: 'This value is set by afterChange by Admin Global.'
													},
												},
											]
										}
									]
								}
							]
						},
						// --- site.updatedBy
						{
							type: 'text',
							name: 'updatedBy',
							admin: {
								hidden: true
							}
						},
						// --- site.urls
						/*  updated by page
							object with {
								page.id: {
									locale: page.url
								}
							}
						*/
						{
							type: 'json',
							name: 'urls',
							localized: false,
							label: 'site.urls',
							defaultValue: {},
						},
					]
				},
				// --- OPTIONS [tab]
				{
					label: {
						de: 'Options',
						en: 'Optionen'
					},
					fields: [
						// --- site.locales
						{
							type: 'group',
							name: 'locales',
							label: {
								de: 'Spracheinstellungen',
								en: 'Language Settings'
							},
							fields: [
								// --- site.locales.used
								// * save posts/events collection
								// * init other locales
								// * update related pages [footers, navs, headers]
								// * save other locale pages
								{
									type: 'select',
									name: 'used',
									label: {
										en: 'Languages that your website will use',
										de: 'Verwendete Sprachen für die Website'
									},
									hasMany: true,
									defaultValue: ['de'],
									admin: {
										description: {
											en: 'Be aware that removing any language additional to your default language will remove all webpages generated in that language.',
											de: 'Achtung: Das Entfernen einer Sprache führt dazu, dass alle Webpages in dieser Sprache entfernt werden.'
										}
									},
									validate: (value, { data }) => (value && !value.includes(data.locales.default)) ? `You can't remove the default language` : true,
									options: [
										{
											label: 'Deutsch',
											value: 'de',
										},
										{
											label: 'English',
											value: 'en',
										},
									],
								},
								// --- site.locales.default
								{
									type: 'select',
									name: 'default',
									label: {
										en: 'Default Language',
										de: 'Standard Sprache'
									},
									required: false,
									validate: (value, { payload }) => exists(value, payload),
									admin: {
										description: {
											de: 'Legt fest welche Sprachversion der Homepage zuerst angezeigt werden soll.',
											en: 'Determines which language version of your homepage is presented first.'
										}
									},
									defaultValue: 'de',
									options: [
										{
											label: 'Deutsch',
											value: 'de',
										},
										{
											label: 'English',
											value: 'en',
										},
									],
								},
								// --- site.locales.updateOthers
								{
									type: 'checkbox',
									name: 'updateOthers',
									label: {
										de: 'Automatische Updates der anderen Sprachversion',
										en: 'Automatically update other languages'
									},
									admin: {
										condition: (data, siblingData) => (siblingData.initOthers === true) ? true : false,
										description: {
											de: 'Veränderungen in einer Sprachversion lösen beim Speichern automatisch ein Update der anderen Sprachversionen aus.',
											en: 'Changes in one language version automatically trigger an update of the other version.'
										}
									},
									defaultValue: false,
								},
							]
						},
						// --- site.fonts
						{
							type: 'group',
							name: 'fonts',
							fields: [
								// --- site.fonts.body
								{
									type: 'relationship',
									name: 'body',
									relationTo: 'fonts',
									label: {
										de: 'Standard-Schriftart',
										en: 'Default Font'
									},
									maxDepth: 0,
									required: false,
									admin: {
										disableBulkEdit: true,
									},
									hooks: {
										beforeValidate: [
											async ({ operation, context }) => {
												if (operation === 'create') {
													return await getRandomDocID('fonts', context.user)
												}
											}
										],
									}
								},
								// --- site.fonts.headings
								{
									type: 'relationship',
									name: 'headings',
									relationTo: 'fonts',
									label: {
										de: 'Schriftart für Überschriften',
										en: 'Font for Headings'
									},
									maxDepth: 0,
									required: false,
									admin: {
										disableBulkEdit: true,
									},
									hooks: {
										beforeValidate: [
											async ({ operation }) => {
												if (operation === 'create') {
													return await getRandomDocID('fonts', user)
												}
											}
										]
									}
								},
								// --- site.fonts.css
								{
									type: 'code',
									name: 'css',
									label: 'site.fonts.css',
									localized: false,
									admin: {
										condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
										language: 'css',
										readOnly: true,
									},
									hooks: {
										beforeChange: [
											async ({ data, context, value, req }) => {

												if (!req.user) return // is undefined when updated by localAPI - even with overrideAccess: false and user: req.user 

												value = ''
												context.fonts ??= {}
												let fontFaces = []

												if (data.fonts.body) {
													context.fonts.body ??= await getRelatedDoc('fonts', data.fonts.body, context.user, { depth: 0 })
													fontFaces.push(context.fonts.body.face)
												}
												if (data.fonts.headings) {
													context.fonts.headings ??= await getRelatedDoc('fonts', data.fonts.headings, context.user, { depth: 0 })
													fontFaces.push(context.fonts.headings.face)
												}

												return createFontCSS(fontFaces, context.fonts.body, context.fonts.headings) // update data.fonts.css
											}
										]
									}
								},
							],
						},
						// --- site.colors
						{
							type: 'group',
							name: 'colors',
							fields: [
								{
									type: 'row',
									fields: [
										// --- site.colors.primary
										{
											type: 'text',
											name: 'primary',
											label: {
												de: 'Primäre Farbe',
												en: 'Primary Color'
											},
											admin: {
												components: {
													Field: colorPickerField,
												},
											},
											defaultValue: `#${Math.floor(Math.random() * 16777215).toString(16)}`
										},
										// --- site.colors.secondary
										{
											type: 'text',
											name: 'secondary',
											label: {
												de: 'Sekundäre Farbe',
												en: 'Secondary Color'
											},
											admin: {
												components: {
													Field: colorPickerField,
												},
											},
											defaultValue: `#${Math.floor(Math.random() * 16777215).toString(16)}`
										},
									]
								}
							]
						},
						// --- site.background
						{
							type: 'group',
							name: 'background',
							label: 'Background',
							fields: [
								// --- site.background.img
								{
									type: 'upload',
									name: 'img',
									label: {
										de: 'Hintergrundbild',
										en: 'Background Image'
									},
									relationTo: 'images',
									hooks: {
										beforeValidate: [
											// Runs before the update operation
											async ({ value, context, operation, data, originalDoc, siblingData }) => {

												if (context.isUpdatedByCode) return

												if (value) {
													const img = await getRelatedDoc('images', value, context.user, { depth: 0 })
													siblingData.img_filename = img.filename
													//data.css = CSSObjUpdate(data.css, 'body', 'background-image', `url("/assets/imgs/${img.filename}")`) // update data.css	
												}
												else {
													siblingData.img_filename = null
													//data.css = CSSObjRemoveKey(data.css, 'body', 'background-image') // update data.css	
												}
												context.updatePages = true
											}
										]
									}
								},
								// --- site.background.img_filename
								{
									type: 'text',
									name: 'img_filename',
									admin: {
										hidden: true
									}
								}

							]
						},
						// --- site.css
						/* 	- updated by site.colors
						*/
						{
							type: 'json',
							name: 'css',
							admin: {
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							defaultValue: defaultUserCSS,
							hooks: {
								beforeChange: [
									({ value, data }) => {
										// data.background.img
										value = (data.background.img_filename)
											? CSSObjUpdate(value, 'body', 'background-image', `url("/assets/imgs/${data.background.img_filename}")`)
											: CSSObjRemoveKey(value, 'body', 'background-image') // update data.css	

										// data.colors
										value = CSSObjUpdate(value, 'html', '--primary', data.colors.primary) // update data.css
										value = CSSObjUpdate(value, 'html', '--secondary', data.colors.secondary) // update data.css
										return value
									}
								]
							}
						},
						// --- site.backend
						/* {
							type: 'group',
							name: 'backend',
							label: {
								de: 'Backend',
								en: 'Backend'
							},
							admin: {
								condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
							},
							fields: [
								// --- site.backend.deployTo
								{
									type: 'radio',
									name: 'deployTo',
									defaultValue: 'netlify',
									required: true,
									options: ['cloudflare', 'netlify'],
									access: {
										update: isAdmin
									},
								},
								// --- site.backend.deployToken
								{
									type: 'text',
									name: 'deployToken',
									required: true,
									access: {
										update: isAdmin
									},
								},
							]
						}, */
					]
				},
			]
		},
		// --- SIDEBAR ---
		// --- freezeSite
		/* {
			type: 'checkbox',
			name: 'freezeSite',
			defaultValue: false,
			admin: {
				position: 'sidebar',
				description: {
					en: '',
					de: 'Verhindert, dass die Seite beim Logout hochgeladen wird.'
				}
			}
		}, */
		// --- site.fullUpdate
		{
			type: 'checkbox',
			name: 'fullUpdate',
			defaultValue: false,
			admin: {
				position: 'sidebar',
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
			},
			hooks: {
				beforeChange: [
					({ value, context }) => {
						if (value === true) {
							context.fullUpdate = true
						}
						return false
					}
				],
				afterChange: [
					async ({ value, context, collection, req, originalDoc, operation }) => {
						/*
							Type:
								afterChange
								fieldHook
							Task: 
								Update all other locales of this document with this document's data
							Attention:
								The field value is always reset to false
								But still 'value' holds the original value given in the admin panel
						*/
						try {
							if (value === true) {
								context.site = originalDoc

								for (const loc of originalDoc.locales.used) {
									// update pages
									await updateDocsMany('pages', context.user, {
										where: {
											site: { equals: originalDoc.id }
										},
										data: { updatedBy: `sites` },
										depth: 0,
										locale: loc,
										context: {
											updatedBy: 'sites',
											isUpdatedByCode: true,
											isFullUpdate: true,
											site: originalDoc,
											...context,
										}
									})
									// update navs
									await updateDocsMany('navs', context.user, {
										where: {
											site: { equals: originalDoc.id }
										},
										data: { updatedBy: `sites` },
										depth: 0,
										locale: loc,
										context: {
											updatedBy: 'sites',
											isUpdatedByCode: true,
											site: originalDoc,
											...context,
										}
									})
									// update headers
									await updateDocsMany('headers', context.user, {
										where: {
											site: { equals: originalDoc.id }
										},
										data: { updatedBy: `sites` },
										depth: 0,
										locale: loc,
										context: {
											updatedBy: 'sites',
											isUpdatedByCode: true,
											site: originalDoc,
											...context,
										}
									})
									// update posts
									await updateDocsMany('posts-flex', context.user, {
										where: {
											site: { equals: originalDoc.id }
										},
										data: { updatedBy: `sites` },
										depth: 0,
										locale: loc,
										context: {
											updatedBy: 'sites',
											isUpdatedByCode: true,
											site: originalDoc,
											...context,
										}
									})
								}
							}
						} catch (error) {
							log(error.stack, context.user, __filename, 3)
							mailError(error, req)
						}
					}
				]
			}
		},
	]
}

function writeSiteCSS(doc) {
	let content = ''
	content += insertCSSRule('html', '--primary', `'${doc.colors.primary}'`)
}

function createFontCSS(fontFaces = [], fontBody = {}, fontHeadings = {}) {
	/* (re)create fonts.css */

	let css = ''
	for (const fontface of fontFaces) {
		css += fontface
	}

	css += (fontBody) ? insertCSSRule('body', 'font-family', `'${fontBody.familyName}'`) : ''
	css += (fontHeadings) ? insertCSSRule('h1, h2, h3, h4, h5', 'font-family', `'${fontHeadings.familyName}'`) : ''

	return css
}

function insertCSSRule(selector = '', key = '', value = '') {
	return `${selector} { \n\t${key}: ${value};\n}\n`
}

function exists(value, payload) {

	let response

	if (!payload) {
		// skip client-side validation
		response = true
	} else {
		// server-side validation
		if (!value) {
			response = 'required'
		}
		else {
			response = true
		}
	}

	return response
}

function isValidPath(value, payload) {

	let response

	if (!payload) {
		// skip client-side validation
		response = true
	} else {
		// server-side validation

		if (!value) {
			response = 'required'
		}
		else if (value.endsWith('/')) {
			response = 'Trailing slash is not allowed!'
		}
		else {
			response = true
		}
	}

	return response
}

function isValidDomain(str) {
	const regexp = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i;
	if (regexp.test(str)) {
		return true;
	}
	else {
		return false;
	}
}

function updateJSONField(args, payloadPath = '', jsonPath = 'id') {
	// 6532250ab9d019ee84981d82: ['un-menu-bar']
	// args.data and args.value contain the new data
	// args.originalDoc contain the old data

	if (args.operation === 'update' && args.value) {
		// update an existing value
		let previousField = resolveObjPath(args.originalDoc, payloadPath)
		// update only the corresponding ID within the json
		if (jsonPath === 'id') {
			const id = Object.keys(args.value)[0]
			previousField[id] = args.value[id]
		}
		else if (jsonPath === 'locale.id') {
			const locale = Object.keys(args.value)[0]
			if (!['de', 'en'].includes(locale)) {
				throw new Error(`unknown locale: ${locale}`)
			}
			const id = Object.keys(args.value[locale])[0]
			previousField[locale][id] = args.value[locale][id]
		}

		return previousField
	}
}

function updateJSONFieldBackup1(args, payloadPath = '', jsonPath = 'id') {
	// 6532250ab9d019ee84981d82: ['un-menu-bar']
	// args.data and args.value contain the new data
	// args.originalDoc contain the old data

	if (args.operation === 'update' && args.value) {
		// update an existing value
		let fieldUpdate = resolveObjPath(args.data, payloadPath)
		// update only the corresponding ID within the json
		if (jsonPath === 'id') {
			const id = Object.keys(fieldUpdate)[0]
			args.value[id] = fieldUpdate[id]
		}
		else if (jsonPath === 'locale.id') {
			const locale = Object.keys(fieldUpdate)[0]
			if (!['de', 'en'].includes(locale)) {
				throw new Error(`unknown locale: ${locale}`)
			}
			const id = Object.keys(fieldUpdate[locale])[0]
			args.value[locale][id] = fieldUpdate[locale][id]
		}

		return args.value
	}
}