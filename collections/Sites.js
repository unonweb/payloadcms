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
import cpFile from '../hooks/_cpFile';
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
		/* preview: async (doc) => {
			const mode = getAppMode()
			return `${doc.origin[mode]}`;
		}, */
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
			async ({ args, operation }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [sites] "${args.req.context.timeID}"`)
				}

			}
		],
		// --- beforeValidate
		beforeValidate: [
			// runs after client-side validation
			// runs before server-side validation
			async ({ data, req, operation, originalDoc }) => {
				try {

					if (operation === 'create') {
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
					const user = req?.user?.shortName ?? 'internal'
					log('--- beforeChange ---', user, __filename, 7)

					/* update data.assets.fonts */
					const fontBody = await getRelatedDoc('fonts', data.frontend.fonts.body, user, { depth: 0 })
					const fontHeadings = await getRelatedDoc('fonts', data.frontend.fonts.headings, user, { depth: 0 })

					data.assets.fonts = [
						fontBody.filename ?? '',
						fontHeadings.filename ?? ''
					]

					const fontFaces = [
						fontBody.face ?? '',
						fontHeadings.face ?? ''
					]

					/* update data.frontend.fonts.css */
					data.frontend.fonts.css = createFontCSS(fontFaces, fontBody, fontHeadings)

					/* update data.frontend.css */
					if (hasChanged(data.frontend.colors, originalDoc.frontend.colors, user)) {
						let newCSS
						newCSS = updateCSSObj(data.frontend.css, 'html', '--primary', data.frontend.colors.primary)
						newCSS = updateCSSObj(newCSS, 'html', '--secondary', data.frontend.colors.secondary)
						data.frontend.css = newCSS
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
					const user = req?.user?.shortName ?? 'internal'
					
					context.site = doc
					const mode = getAppMode()
					const pathSite = `${doc.paths.fs.site}/${mode}`

					/* cp font files */
					await cpAssets(`${process.cwd()}/upload/fonts`, `${pathSite}/assets`, doc.assets.fonts)

					/* write font.css */
					if (doc?.frontend?.fonts?.css !== previousDoc?.frontend?.fonts?.css || !await canAccess(`${pathSite}/assets/fonts.css`)) {
						saveToDisk(`${pathSite}/assets/fonts.css`, doc.frontend.fonts.css, user)
					}

					/* write user.css */
					if (JSON.stringify(doc?.frontend?.css) !== JSON.stringify(previousDoc?.frontend?.css) || !await canAccess(`${pathSite}/assets/user.css`)) {
						let userCSS = convertJSONToCSS(doc.frontend.css)
						await saveToDisk(`${pathSite}/assets/user.css`, userCSS, user)
					}
					
					if (operation === 'create') {

						/* INIT FS STRUCTURE */
						if (!existsSync(doc.paths.fs.site)) {
							await fsPromises.mkdir(doc.paths.fs.site)
							await fsPromises.mkdir(doc.paths.fs.assets)
							await fsPromises.mkdir(doc.paths.fs.customElements)
							await fsPromises.mkdir(doc.paths.fs.imgs)
						}

						/* INIT PAYLOAD */
						// needs to be run in afterChange hook because before this site has no id yet
						if (initPayload) {
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
					const user = req?.user?.shortName ?? 'internal'
					log(`--- afterDelete ---`, user, __filename, 7)
					context.siteIsDeleted = true

					// remove site files
					if (doc.backend.onDelete.rmSiteFiles === true) {
						const pathSite = doc.paths.fs.site
						await rmFile(pathSite, user, { recursive: true, force: true })
					}
					// remove 'Pages' Data
					if (doc.backend.onDelete.rmPagesData === true) {
						await rmDocs('pages', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Posts' Data
					if (doc.backend.onDelete.rmPostsData === true) {
						await rmDocs('posts', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Headers' Data
					if (doc.backend.onDelete.rmHeadersData === true) {
						await rmDocs('headers', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Nav' Data
					if (doc.backend.onDelete.rmNavsData === true) {
						await rmDocs('navs', user, {
							where: { site: { equals: id } }
						})
					}
					// remove 'Footers' Data
					if (doc.backend.onDelete.rmFootersData === true) {
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
			async ({ args, operation, result }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					console.timeEnd(`<7>[time] [sites] "${args.req.context.timeID}"`)
				}
			}
		],
	},
	// --- fields
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
		// --- tabs
		{
			type: 'tabs',
			tabs: [
				// --- ASSETS [tab-1]
				{
					label: 'Assets',
					fields: [
						// --- site.assets
						{
							type: 'group',
							name: 'assets',
							fields: [
								// --- site.assets.fromPages
								// ---> array of ids with all related assets
								{
									type: 'collapsible',
									label: 'fromPages',
									admin: {
										initCollapsed: true,
									},
									fields: [
										// --- site.assets.fromPages
										{
											type: 'json',
											name: 'fromPages',
											label: ' ',
										},
									]
								},
								// --- site.assets.fromPosts
								// ---> array of ids with all related assets
								{
									type: 'collapsible',
									label: 'fromPosts',
									admin: {
										initCollapsed: true,
									},
									fields: [
										// --- assets.fromPosts
										{
											type: 'json',
											name: 'fromPosts',
											label: ' ',
										},
									]
								},
								// --- site.assets.fonts
								// 	* updated in beforeChange
								//	* required for cleanUpSite()
								{
									type: 'json',
									name: 'fonts',
									label: 'site.assets.fonts',
									defaultValue: [],
								},
								// --- site.assets.bundle
								{
									type: 'json',
									name: 'bundle',
									label: 'site.assets.bundle',
									defaultValue: [],
								},
								// --- site.assets.lib
								//		(filenames)
								{
									type: 'json',
									name: 'lib',
									label: 'site.assets.lib',
									defaultValue: []
								},
								// --- site.assets.cElements
								{
									type: 'group',
									name: 'cElements',
									fields: [
										/* // --- site.assets.cElements.bundles
										// --> object with 'css' and 'js' key
										// not used any more because we use the static bundle filenames 'bundle.js' and 'bundle.css'
										{
											type: 'json',
											name: 'bundles',
											label: 'site.assets.cElements.bundles',
										}, */
										// --- site.assets.cElements.files
										// * object with two keys: 'css' and 'js' and respectively an array of filenames
										// * required for dev build where all files are inserted individually
										// * set by 'pages'
										{
											type: 'json',
											name: 'files',
											label: 'site.assets.cElements.files',
										},
										// --- site.assets.cElements.lastModifiedSum
										{
											type: 'number',
											name: 'lastModifiedSum',
											label: 'site.assets.cElements.lastModifiedSum',
											defaultValue: 0,
											admin: {
												hidden: true,
											}
										}
									]
								}

							]
						},
					]
				},
				// --- PATHS [tab-2]
				{
					label: 'Paths',
					name: 'paths',
					fields: [
						// --- site.paths.web
						{
							type: 'group',
							name: 'web',
							label: {
								de: 'Web',
								en: 'Web'
							},
							access: {
								update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin'))
							},
							fields: [
								// --- site.paths.web.origin
								{
									type: 'group',
									name: 'origin',
									fields: [
										// --- site.paths.web.origin.dev
										{
											type: 'text',
											name: 'dev',
											required: false,
											admin: {
												placeholder: 'http://<domain>.local'
											},
											validate: (value, { payload }) => exists(value, payload)
										},
										// --- site.paths.web.origin.prod
										{
											type: 'text',
											name: 'prod',
											required: false,
											admin: {
												placeholder: 'https://<domain>.de'
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
							access: {
								update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin'))
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
								// --- site.paths.fs.assets
								// --- not used any more
								{
									type: 'text',
									name: 'assets',
									label: 'site.paths.fs.assets',
									required: false,
									admin: {
										placeholder: '/home/payload/sites/<domain>/assets'
									},
									validate: (value, { payload }) => isValidPath(value, payload),
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
								// --- site.paths.fs.customElements
								// --- not used any more
								{
									type: 'text',
									name: 'customElements',
									label: 'site.paths.fs.customElements',
									required: false,
									admin: {
										placeholder: '/home/payload/sites/<domain>/assets/custom-elements'
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
				// --- OPTIONS [tab-5]
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
								// --- site.locales.initOthers
								{
									type: 'checkbox',
									name: 'initOthers',
									label: {
										de: 'Erste Sprachversion initialisiert alle anderen',
										en: 'First language version initializes all others'
									},
									admin: {
										description: {
											de: 'Die Inhalte der ersten Sprachversion eines Beitrags/Posts werden auf alle anderen kopiert (und können dann angepasst/übersetzt werden).',
											en: 'The contents of the first language version of a posts are copied to the other languages in order to serve as a starting point for translations.'
										}
									},
									defaultValue: false,
								},
							]
						},
						// --- site.frontend
						{
							type: 'group',
							name: 'frontend',
							label: {
								de: 'Frontend',
								en: 'Frontend'
							},
							fields: [
								// --- site.frontend.fonts
								{
									type: 'group',
									name: 'fonts',
									fields: [
										//--- site.frontend.fonts.body
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
											defaultValue: async ({ user }) => await getRandomDocID('fonts', user.shortName),
										},
										//--- site.frontend.fonts.headings
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
											defaultValue: async ({ user }) => await getRandomDocID('fonts', user.shortName),
										},
										// --- site.frontend.fonts.css
										{
											type: 'code',
											name: 'css',
											label: 'site.frontend.fonts.css',
											localized: false,
											admin: {
												language: 'css',
												readOnly: true
											},
										},
									],
								},
								// --- site.frontend.colors
								{
									type: 'group',
									name: 'colors',
									fields: [
										{
											type: 'row',
											fields: [
												// --- site.frontend.colors.primary
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
												// --- site.frontend.colors.secondary
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
								// --- site.frontend.css
								{
									type: 'json',
									name: 'css',
									defaultValue: defaultUserCSS
								},
							]
						},
						// --- site.backend
						{
							type: 'group',
							name: 'backend',
							label: {
								de: 'Backend',
								en: 'Backend'
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
									admin: {
										condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
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
									admin: {
										condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
									},
								},
								// --- site.backend.onDelete
								{
									type: 'group',
									name: 'onDelete',
									label: 'On Delete',
									access: {
										update: isAdmin
									},
									admin: {
										description: 'Remove ...',
										condition: (data, siblingData, { user }) => {
											if (user && user?.roles?.includes('admin')) {
												return true
											} else {
												return false
											}
										},
									},
									fields: [
										// --- site.backend.onDelete.rmSiteFiles
										{
											type: 'checkbox',
											name: 'rmSiteFiles',
											label: 'site files',
											defaultValue: true,
										},
										{
											type: 'checkbox',
											name: 'rmPagesData',
											label: 'data from "Pages"-Collection',
											defaultValue: true,
										},
										{
											type: 'checkbox',
											name: 'rmPostsData',
											label: 'data from "Posts"-Collection',
											defaultValue: true,
										},
										{
											type: 'checkbox',
											name: 'rmHeadersData',
											label: 'data from "Headers"-Collection',
											defaultValue: true,
										},
										{
											type: 'checkbox',
											name: 'rmNavsData',
											label: 'data from "Navs"-Collection',
											defaultValue: true,
										},
										{
											type: 'checkbox',
											name: 'rmFootersData',
											label: 'data from "Footers"-Collection',
											defaultValue: true,
										},
									]
								},
							]
						},
					]
				},
			]
		},


		// --- SIDEBAR ---

		// --- editingMode
		editingModeField,
		// --- freezeSite
		{
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
		},
	]
}

function writeSiteCSS(doc) {
	let content = ''
	content += insertCSSRule('html', '--primary', `'${doc.frontend.colors.primary}'`)
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

/* async function writeFontCSSFile(fontBody = {}, fontHeadings = {}, destPath = '', user = '') {

	let content = ''

	content += (fontBody) ? ctFontFace(fontBody) : ''
	content += (fontHeadings) ? ctFontFace(fontHeadings) : ''
	content += (fontBody) ? insertCSSRule('body', 'font-family', `'${fontBody.family.name}'`) : ''
	content += (fontHeadings) ? insertCSSRule('h1, h2, h3, h4, h5', 'font-family', `'${fontHeadings.family.name}'`) : ''

	// write fonts.css
	if (content) {
		saveToDisk(destPath, content, user)
	}
} */

/* function ctFontFace(font = {}, fontAssetsDir = '/assets') {
	const url = `${fontAssetsDir}/${font.filename}`
	// defaults
	let fontWeight = 400
	let fontStyle = 'normal'

	switch (font.variant) {
		case 'light':
			fontWeight = 300
			break
		case 'bold':
			fontWeight = 700
			break
		case 'italic':
			fontStyle = 'italic'
		default:
			break;
	}

	let content = `@font-face { \n\tfont-family: '${font.family.name}'; \n\tsrc: url('${url}') format('woff2'); \n\tfont-display: block; \n\tfont-weight: ${fontWeight}; \n\tfont-style: ${fontStyle};\n}\n`
	return content
} */

function insertCSSRule(selector = '', key = '', value = '') {
	return `${selector} { \n\t${key}: ${value};\n}\n`
}

async function getDefaultValue(col = '') {
	// not perfect
	const res = await fetch('/api/fonts')
	if (res.ok) {
		const data = await res.json()
		if (data?.docs[0]?.id) {
			return data.docs[0].id
		} else {
			return null
		}
	}
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

function updateCSSObj(css = {}, selector = '', key = '', val = '') {

	if (typeof css === 'undefined') {
		css = {}
	}
	if (typeof css === 'string') {
		css = JSON.parse(css)
	}

	if (css.hasOwnProperty(selector)) {
		css[selector][key] = val // css[selector][key] already exist - overwrite
	}
	else {
		// create new selector with that key: value
		css[selector] = {
			[key]: val
		}
	}

	return css
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