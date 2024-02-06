import * as React from "react";

/* ACCESS */
import { isAdmin } from '../../access/isAdmin.js';
import { isLoggedIn } from "../../access/isLoggedIn.js";

/* HOOKS & HELPERS */
import log from '../../helpers/customLog.js';
import getUserSites from '../../hooks/getUserSites.js';
import getRelatedDoc from '../../hooks/getRelatedDoc.js';
import getDoc from '../../hooks/getDoc.js';

export const Fonts = {
	slug: 'fonts',
	labels: {
		singular: {
			de: 'Schriftart',
			en: 'Font'
		},
		plural: {
			de: 'Schriftarten',
			en: 'Fonts'
		},
	},
	upload: {
		staticURL: '/fonts',
		staticDir: '../upload/fonts', // cwd is src
		mimeTypes: ['font/woff2'],
	},
	access: {
		create: isLoggedIn,
		update: isLoggedIn,
		read: isLoggedIn,
		delete: isAdmin,
	},
	admin: {
		group: 'Upload',
		enableRichTextRelationship: false,
		enableRichTextLink: false,
		useAsTitle: 'title',
		defaultColumns: ['title', 'family', 'variant'],
		description: () => {
			return (
				<span>Es wird nur das WOFF2-Format akzeptiert<br></br> <u><a href="https://www.fontsquirrel.com/" target="_blank">Schriftarten herunterladen</a></u> <br></br> <u><a href="https://www.fontsquirrel.com/tools/webfont-generator" target="_blank">Schriftarten in WOFF2 konvertieren</a></u></span>
			)
		}
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => {
				if (['create', 'update', 'delete'].includes(operation)) {
					// if this page is updated internally by another localized version of the same page
					// 'args.req.context.sites' is already set by the update operation
					if (args.req.user) {
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
					}
					args.req.context.timeID ??= Date.now()
					console.time(`<7>[time] [fonts] "${args.req.context.timeID}"`)
				}
			}
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

					const family = await getDoc('font-families', data.family, user)
					data.familyName = family.name
					data.face = ctFontFace(data, family.name, '/assets')

					return data

				} catch (error) {
					log(error.stack, user, __filename, 3)
				}
			}
		],
		/* afterChange: [
			async ({ req, doc, operation }) => {
				try {
					if (operation === 'create') {
						log('font created: ', doc.title)
					}
				} catch (error) {
					log(err.stack, user, __filename, 3)
				}
			}
		] */
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => {
				if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
					console.timeEnd(`<7>[time] [fonts] "${args.req.context.timeID}"`)
				}
			}
		],
	},
	// --- fields
	fields: [
		// --- font.title
		{
			type: 'text',
			name: 'title',
			label: {
				en: 'Title',
				de: 'Titel'
			},
			admin: {
				placeholder: {
					en: 'Leave empty to insert automatically from file name',
					de: 'Leer lassen für automatische Generierung durch Dateinamen'
				},
				description: {
					en: 'Only used for identification within Payload',
					de: 'Wird nur zur Identifikation in Payload verwendet'
				},
			},
			hooks: {
				beforeValidate: [
					(args) => (args.value) ? args.value : insertFromFilename(args)
				]
			}
		},
		// --- font.family
		{
			type: 'relationship',
			name: 'family',
			relationTo: 'font-families',
			label: {
				de: 'Schriftart-Familie (Font Family)',
				en: 'Font Family'
			},
			required: true,
			admin: {
				description: {
					en: 'To which family belongs this font?',
					de: 'Zu welcher Familie gehört diese Schriftart?'
				}
			}
		},
		// --- font.familyName
		{
			type: 'text',
			name: 'familyName',
			label: {
				de: 'Name der Schriftart-Familie',
				en: 'Font Family Name'
			},
			required: false,
			admin: {
				readOnly: true,
			}
		},
		// --- font.variant
		{
			type: 'select',
			name: 'variant',
			label: {
				de: 'Variante',
				en: 'Variant'
			},
			required: true,
			options: ['generic', 'light', 'regular', 'bold', 'italic', 'condensed'],
		},
		// --- font.example
		{
			type: 'text',
			name: 'example',
			label: {
				de: 'Beispiel',
				en: 'Example'
			},
			required: false,
			admin: {
				placeholder: 'https://www.fontsquirrel.com/'
			}
		},
		// --- font.isLegal
		{
			type: 'checkbox',
			name: 'isLegal',
			label: {
				en: 'The license of this font allows me to use it for this website',
				de: 'Die Lizenz dieser Schriftart erlaubt die Verwendung für diese Webseite'
			},
			required: true
		},
		// --- font.face
		{
			type: 'code',
			name: 'face',
			localized: false,
			admin: {
				language: 'css',
			},
		},
	]
}

function ctFontFace(font = {}, family = '', fontAssetsDir = '') {
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
			break
		default:
			break;
	}

	return `@font-face { \n\tfont-family: '${family}'; \n\tsrc: url('${url}') format('woff2'); \n\tfont-display: block; \n\tfont-weight: ${fontWeight}; \n\tfont-style: ${fontStyle};\n}\n`
}

function insertFromFilename(args) {
	// field hook
	// beforeValidate
	const filename = args?.req?.files?.file?.name ?? args.data.filename // "aaef873cad9c2eab3fe9d980b2a07184.webp"
	// the first one is defined when uploading
	// the second one is defined when editing
	const splits = filename.split('.')
	const ext = `.${splits[splits.length - 1]}`
	return filename.replace(ext, '') // strip off extension
}