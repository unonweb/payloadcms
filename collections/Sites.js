/* ACCESS */
import { isAdmin } from '../access/isAdmin';
import log from '../helpers/customLog';

/* FIELDS */
import colorPickerField from '../components/color-picker-field';

/*  HOOKS & HELPERS */
import mailError from '../helpers/mailError';
import rmDocs from '../helpers/rmDocs';
import rmFile from '../helpers/_rmFile';
import resolveObjPath from '../helpers/_resolveObjPath';
import getRandomDocID from '../hooks/getRandomDocID';
import getRelatedDoc from '../hooks/getRelatedDoc';
import saveToDisk from '../helpers/_saveToDisk';
import CSSFromJSON from '../helpers/CSSFromJSON';
import canAccess from '../helpers/_canAccess';
import updateDocsMany from '../hooks/updateDocsMany';
import CSSObjUpdate from '../helpers/CSSObjUpdate';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime';
import endConsoleTime from '../hooks/afterOperation/endConsoleTime';
import CSSObjRemoveKey from '../helpers/CSSObjRemoveKey';
import copyAssets from '../hooks/afterChange/copyAssets';
import setSiteDefaults from '../hooks/beforeValidate/setSiteDefaults';
import initFSPaths from '../hooks/afterChange/initFSPaths';
import populateContextBeforeOp from '../hooks/beforeOperation/populateContext';
import populateContextBeforeVal from '../hooks/beforeValidate/populateContext';

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
		"--split-complementary-2": "color-mix(in oklch longer hue, var(--primary) 58.333%, var(--primary-clone))",
		"--primary-alpha-95": "color-mix(in oklab, var(--primary), transparent 95%)",
		"--primary-alpha-85": "color-mix(in oklab, var(--primary), transparent 85%)",
		"--primary-alpha-75": "color-mix(in oklab, var(--primary), transparent 75%)",
		"--primary-alpha-50": "color-mix(in oklab, var(--primary), transparent 50%)",
		"--primary-alpha-25": "color-mix(in oklab, var(--primary), transparent 25%)",
		"--primary-white-85": "color-mix(in oklab, var(--primary), white 85%)",
		"--primary-white-75": "color-mix(in oklab, var(--primary), white 75%)",
		"--primary-white-60": "color-mix(in oklab, var(--primary), white 60%)",
		"--primary-white-50": "color-mix(in oklab, var(--primary), white 50%)",
		"--primary-white-40": "color-mix(in oklab, var(--primary), white 40%)",
		"--primary-white-30": "color-mix(in oklab, var(--primary), white 30%)",
		"--primary-white-20": "color-mix(in oklab, var(--primary), white 20%)",
		"--primary-white-10": "color-mix(in oklab, var(--primary), white 10%)",
		"--primary-white-5": "color-mix(in oklab, var(--primary), white 5%)",
		"--primary-black-50": "color-mix(in oklab, var(--primary), black 50%)",
		"--primary-black-25": "color-mix(in oklab, var(--primary), black 25%)",
		"--primary-black-15": "color-mix(in oklab, var(--primary), black 15%)",
		"--primary-black-10": "color-mix(in oklab, var(--primary), black 10%)",
		"--complementary-alpha-95": "color-mix(in oklab, var(--complementary), transparent 95%)",
		"--complementary-alpha-85": "color-mix(in oklab, var(--complementary), transparent 85%)",
		"--complementary-alpha-75": "color-mix(in oklab, var(--complementary), transparent 75%)",
		"--complementary-alpha-50": "color-mix(in oklab, var(--complementary), transparent 50%)",
		"--complementary-alpha-25": "color-mix(in oklab, var(--complementary), transparent 25%)",
		"--complementary-white-85": "color-mix(in oklab, var(--complementary), white 85%)",
		"--complementary-white-75": "color-mix(in oklab, var(--complementary), white 75%)",
		"--complementary-white-60": "color-mix(in oklab, var(--complementary), white 60%)",
		"--complementary-white-30": "color-mix(in oklab, var(--complementary), white 30%)",
		"--complementary-white-10": "color-mix(in oklab, var(--complementary), white 10%)",
		"--complementary-white-5": "color-mix(in oklab, var(--complementary), white 5%)",
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
			async ({ data, req, operation, originalDoc }) => {
				/* 
					Task:
						Update assets
					Arguments:
						data holds the current values even if it's set in beforeValidate field hooks
				*/

				data.assets.imgs = []
				if (data.background.img_filename) {
					data.assets.imgs.push(data.background.img_filename)
				}
			}
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

					/* write font.css */
					if (doc?.css?.fonts !== previousDoc?.css?.fonts || !await canAccess(`${pathSite}/assets/fonts.css`)) {
						saveToDisk(`${pathSite}/assets/fonts.css`, doc.css.fonts, user)
					}

					/* write user.css */
					if (JSON.stringify(doc?.css?.user) !== JSON.stringify(previousDoc?.css?.user) || !await canAccess(`${pathSite}/assets/user.css`)) {
						let userCSS = CSSFromJSON(doc.css.user)
						await saveToDisk(`${pathSite}/assets/user.css`, userCSS, user)
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
					mailError(err)
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
					mailError(err)
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

												for (const font of data.fonts ??= []) {
													context.fonts[font.rel] ??= await getRelatedDoc('fonts', font.rel, context.user, { depth: 0 })
													value.push(context.fonts[font.rel].filename)
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
										},
										// --- site.paths.web.fonts
										{
											type: 'text',
											name: 'fonts',
											label: 'site.paths.web.fonts',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
											defaultValue: 'assets'
										},
										// --- site.paths.web.docs
										{
											type: 'text',
											name: 'docs',
											label: 'site.paths.web.docs',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/docs'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
											defaultValue: 'assets/docs'
										},
										// --- site.paths.web.imgs
										{
											type: 'text',
											name: 'imgs',
											label: 'site.paths.web.imgs',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/imgs'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
											defaultValue: 'assets/imgs'
										},
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
							type: 'array',
							name: 'fonts',
							maxRows: 2,
							fields: [
								{
									type: 'row',
									fields: [
										{
											type: 'relationship',
											name: 'rel',
											relationTo: 'fonts',
											label: {
												de: 'Schriftart',
												en: 'Font'
											},
											maxDepth: 0,
											required: false,
											admin: {
												disableBulkEdit: true,
												width: '50%'
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
										{
											type: 'select',
											name: 'selectors',
											options: ['body', 'headings', 'h1', 'h2', 'h3', 'h4', 'nav',],
											hasMany: true,
											admin: {
												width: '25%'
											},
										}
									]
								},

							]
						},
						/* {
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
							],
						}, */
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
											/* 
												Task:
													Set 'site.img_filename'
												Order:
													Runs before the update operation
												Arguments:
													- originalDoc holds the previous value
													- value holds the current value
												Hint:
													Needs to be beforeValidate because we set and use 'site.img_filename' in consecutive ops
											*/
											async ({ req, value, context, operation, data, field, originalDoc, siblingData }) => {

												if (!req.user) return
												if (context.isUpdatedByCode) return

												if (value) {
													const img = await getRelatedDoc('images', value, context.user, { depth: 0 })
													siblingData.img_filename = img.filename
												}
												else {
													siblingData.img_filename = null
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
							type: 'group',
							name: 'css',
							fields: [
								// --- site.css.user
								{
									type: 'json',
									name: 'user',
									label: 'site.css.user',
									admin: {
										condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
									},
									defaultValue: defaultUserCSS,
									hooks: {
										beforeChange: [
											({ value, data }) => {
												/*
													Task:
														Update field value
													Requires:
														- data.background.img_filename
														- data.colors.primary
														- data.colors.secondary
												*/
												// data.background.img
												if (data.background.img_filename) {
													value = CSSObjUpdate(value, 'body', 'background-image', `url("/assets/imgs/${data.background.img_filename}")`)
												}
												else {
													value = CSSObjRemoveKey(value, 'body', 'background-image') // update data.css	
												}

												// data.colors
												value = CSSObjUpdate(value, 'html', '--primary', data.colors.primary) // update data.css
												value = CSSObjUpdate(value, 'html', '--secondary', data.colors.secondary) // update data.css
												return value
											}
										]
									}
								},
								// --- site.css.fonts
								{
									type: 'code',
									name: 'fonts',
									label: 'site.css.fonts',
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

												context.fonts ??= {}
												let fontFaces = ''
												let fontRules = ''

												for (const font of data.fonts ??= []) {

													/* get and concatenate font-faces */
													context.fonts[font.rel] ??= await getRelatedDoc('fonts', font.rel, context.user, { depth: 0 })
													const fontData = context.fonts[font.rel]
													fontFaces += fontData.face

													/* get and concatenate font-rules */
													let selectors = []
													for (const selector of font.selectors ??= []) {
														switch (selector) {
															case 'headings':
																selectors.push('h1', 'h2', 'h3', 'h4')
																break;
															case 'nav':
																selectors.push('[role="navigation"]', 'un-nav')
																break;
															default:
																selectors.push(selector)
																break;
														}
													}

													fontRules += createCSSRule(selectors.join(', '), 'font-family', fontData.familyName)
												}

												return fontFaces + fontRules
											}
										]
									}
								},
							]
						},
					]
				},
			]
		},
		// --- SIDEBAR ---
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
							mailError(error)
						}
					}
				]
			}
		},
	]
}

function writeSiteCSS(doc) {
	let content = ''
	content += createCSSRule('html', '--primary', `'${doc.colors.primary}'`)
}

function createFontCSS(fontFaces = [], fontBody = {}, fontHeadings = {}) {
	/* (re)create fonts.css */

	let css = ''
	for (const fontface of fontFaces) {
		css += fontface
	}

	css += (fontBody) ? createCSSRule('body', 'font-family', `'${fontBody.familyName}'`) : ''
	css += (fontHeadings) ? createCSSRule('h1, h2, h3, h4, h5', 'font-family', `'${fontHeadings.familyName}'`) : ''

	return css
}

function createCSSRule(selector = '', key = '', value = '') {
	/*
		Formats and returns a CSS-String 
	*/
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