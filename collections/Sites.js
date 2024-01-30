/* ACCESS */
import { isAdmin } from '../access/isAdmin';
import log from '../customLog';

/* FIELDS */
import colorPickerField from '../components/color-picker-field';

/* PAYLOAD */
import payload from 'payload';

/* NODE */
import { promises as fsPromises, existsSync } from 'fs'

/*  HOOKS & HELPERS */
import mailError from '../mailError';
import editingModeField from '../fields/editingMode';
import createDoc from '../hooks/_createDoc';
import rmDocs from '../hooks/rmDocs';
import hasChanged from '../hooks/_hasChanged';
import rmFile from '../hooks/_rmFile';
import initSitePaths from '../hooks/initSitePaths';
import resolveObjPath from '../hooks/_resolveObjPath';
import getRandomDocID from '../hooks/getRandomDocID';
import getRelatedDoc from '../hooks/getRelatedDoc';
import saveToDisk from '../hooks/_saveToDisk';
import convertJSONToCSS from '../hooks/_convertJSONToCSS';
import cpAssets from '../hooks/_cpAssets';
import getAppMode from '../hooks/_getAppMode';
import canAccess from '../hooks/_canAccess';
import capitalizeWords from '../hooks/_capitalizeWords';
import updateDocsMany from '../hooks/updateDocsMany';
import cpFile from '../hooks/_cpFile';
import getDoc from '../hooks/getDoc';
import CSSObjUpdate from '../helpers/CSSObjUpdate';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime';
import endConsoleTime from '../hooks/afterOperation/endConsoleTime';
import CSSObjRemoveKey from '../helpers/CSSObjRemoveKey';
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
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['images', 'documents']),
		],
		// --- beforeValidate
		beforeValidate: [
			// runs after client-side validation
			// runs before server-side validation
			async ({ data, req, operation, originalDoc }) => populateContextBeforeVal({ data, req }),
			async ({ data, req, operation, originalDoc }) => {
				try {
					if (operation === 'create') {

						const user = req?.user?.shortName ?? 'internal'
						log('--- beforeValidate ---', user, __filename, 7)

						/* init paths from Admin global */

						/* constants */
						const domainShort = data.domain.slice(0, data.domain.lastIndexOf('.')) // radjajuschka.de --> radjajuschka
						const admin = await payload.findGlobal({ slug: 'admin' })

						/* default values */
						data.domainShort ??= domainShort // site.domainShort
						data.brandName ??= capitalizeWords(domainShort.replaceAll('-', ' ')) // "haerer-geruestbau" --> "Haerer Geruestbau"
						data.paths.web.origin.dev ??= `http://${domainShort}.unonweb.local`
						data.paths.web.origin.prod ??= `https://${data.domain}`
						data.paths.web.admin.resources = admin.paths.web.resources
						data.paths.fs.admin.sites = admin.paths.fs.sites
						data.paths.fs.admin.customElements = admin.paths.fs.customElements



						// update site paths
						data = initSitePaths(data)
					}

					return data

				} catch (err) {
					log(err.stack, user, __filename, 3)
				}
			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => {
				try {
					// data contains the current values
					// originalDoc contains the previous values
					// seems to work with bulk operations, too
					log('--- beforeChange ---', user, __filename, 7)
					/* update context */
					context.user = req?.user?.shortName ?? 'internal'
					context.mode = getAppMode()
					context.site = data
					context.pathSite = `${data.paths.fs.site}/${context.mode}`
					const user = context.user
					const mode = context.mode

					if (data.fullUpdate) {
						context.fullUpdate = true
						data.fullUpdate = false
					}

					return data

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			}
		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, operation, previousDoc, context }) => {
				try {
					const user = context.user
					const pathSite = context.pathSite
					const mode = context.mode

					/* cp font files */
					await cpAssets(`${process.cwd()}/upload/fonts`, `${pathSite}/assets`, doc.assets.fonts, user)
					await cpAssets(`${process.cwd()}/upload/images`, `${pathSite}/assets/imgs`, doc.assets.imgs, user)

					/* write font.css */
					if (mode === 'dev' || doc?.fonts?.css !== previousDoc?.fonts?.css || !await canAccess(`${pathSite}/assets/fonts.css`)) {
						saveToDisk(`${pathSite}/assets/fonts.css`, doc.fonts.css, user)
					}

					/* write user.css */
					if (mode === 'dev' || JSON.stringify(doc?.css) !== JSON.stringify(previousDoc?.css) || !await canAccess(`${pathSite}/assets/user.css`)) {
						let userCSS = convertJSONToCSS(doc.css)
						await saveToDisk(`${pathSite}/assets/user.css`, userCSS, user)
					}

					if (operation === 'create') {

						/* INIT FS STRUCTURE */
						if (!await canAccess(doc.paths.fs.site)) await fsPromises.mkdir(doc.paths.fs.site)
						// prod
						if (!await canAccess(`${doc.paths.fs.site}/prod/assets/custom-elements`)) await fsPromises.mkdir(`${doc.paths.fs.site}/prod/assets/custom-elements`, { recursive: true })
						if (!await canAccess(`${doc.paths.fs.site}/prod/assets/imgs`)) await fsPromises.mkdir(`${doc.paths.fs.site}/prod/assets/imgs`)
						if (!await canAccess(`${doc.paths.fs.site}/prod/assets/docs`)) await fsPromises.mkdir(`${doc.paths.fs.site}/prod/assets/docs`)
						if (!await canAccess(`${doc.paths.fs.site}/prod/assets/lib`)) await fsPromises.mkdir(`${doc.paths.fs.site}/prod/assets/lib`)
						if (!await canAccess(`${doc.paths.fs.site}/prod/assets/posts`)) await fsPromises.mkdir(`${doc.paths.fs.site}/prod/assets/posts`)
						// dev
						if (!await canAccess(`${doc.paths.fs.site}/dev/assets/custom-elements`)) await fsPromises.mkdir(`${doc.paths.fs.site}/dev/assets/custom-elements`, { recursive: true })
						if (!await canAccess(`${doc.paths.fs.site}/dev/assets/imgs`)) await fsPromises.mkdir(`${doc.paths.fs.site}/dev/assets/imgs`)
						if (!await canAccess(`${doc.paths.fs.site}/dev/assets/docs`)) await fsPromises.mkdir(`${doc.paths.fs.site}/dev/assets/docs`)
						if (!await canAccess(`${doc.paths.fs.site}/dev/assets/lib`)) await fsPromises.mkdir(`${doc.paths.fs.site}/dev/assets/lib`)
						if (!await canAccess(`${doc.paths.fs.site}/dev/assets/posts`)) await fsPromises.mkdir(`${doc.paths.fs.site}/dev/assets/posts`)


						/* INIT PAYLOAD */
						// needs to be run in afterChange hook because before this site has no id yet
						if (false) {
							// disabled currently !!!
							const header = await createDoc('headers', user, {
								locale: doc.locales.default,
								data: {
									site: doc.id,
								}
							})
							const nav = await createDoc('navs', user, {
								locale: doc.locales.default,
								data: {
									site: doc.id,
								}
							})
							const footer = await createDoc('footers', user, {
								locale: doc.locales.default,
								data: {
									site: doc.id,
								}
							})
							/* const page = await createDoc('pages', user, {
								locale: doc.locales.default,
								data: {
									site: doc.id,
									title: doc.domainShort,
									isHome: true,
									header: header.id,
									nav: nav.id,
									footer: footer.id
								}
							}) */
						}
					}

					/* update site.assets.imgs */
					doc.assets.imgs = [
						doc.background.img_filename ?? ''
					]

					/* update pages */
					if (context.updatePages) {
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

					/* full update */
					if (context.fullUpdate) {
						for (const loc of doc.locales.used) {
							// update pages
							await updateDocsMany('pages', user, {
								where: {
									site: { equals: doc.id }
								},
								data: { updatedBy: `sites-${Date.now()}` },
								depth: 0,
								locale: loc,
								context: { site: doc }
							})
							// update navs
							await updateDocsMany('navs', user, {
								where: {
									site: { equals: doc.id }
								},
								data: { updatedBy: `sites-${Date.now()}` },
								depth: 0,
								locale: loc,
								context: { site: doc }
							})
							// update headers
							await updateDocsMany('headers', user, {
								where: {
									site: { equals: doc.id }
								},
								data: { updatedBy: `sites-${Date.now()}` },
								depth: 0,
								locale: loc,
								context: { site: doc }
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
					// remove 'Posts' Data
					if (rmPostsData) {
						await rmDocs('posts', user, {
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
											async ({ value, data, context }) => {
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
										// --- site.paths.fs.posts
										{
											type: 'text',
											name: 'posts',
											label: 'site.paths.fs.posts',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/posts'
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
										// --- site.paths.fs.events
										{
											type: 'text',
											name: 'events',
											label: 'site.paths.fs.events',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/events'
											},
											validate: (value, { payload }) => isValidPath(value, payload),
										},
										// --- site.paths.fs.products
										{
											type: 'text',
											name: 'products',
											label: 'site.paths.fs.products',
											required: false,
											admin: {
												placeholder: '/home/payload/sites/<domain>/assets/products'
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
											async ({ data, context, value }) => {
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
											async ({ value, context, operation, data, siblingData, previousValue }) => {
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

		// --- editingMode
		editingModeField,
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