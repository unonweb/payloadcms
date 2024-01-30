/* ACCESS */
import isAdminOrHasSiteAccess from "../../access/isAdminOrHasSiteAccess.js";
import { isLoggedIn } from "../../access/isLoggedIn.js";

/* HOOKS & HELPERS */
import isAdminOrHasCreated from '../../access/isAdminOrHasCreated.js';
import setFilenameToMd5 from '../../hooks/setFilenameToMd5.js';
import mailError from '../../mailError.js';

const sharpFormatOptions = {
	jpg: {
		format: 'jpeg',
		options: {
			quality: 80,
		},
	},
	webp: {
		// https://sharp.pixelplumbing.com/api-output#webp
		format: 'webp',
		options: {
			quality: 90,
			nearLossless: false,
		},
	}
}

export const Images = {
	slug: 'images',
	labels: {
		singular: {
			de: 'Bild',
			en: 'Image'
		},
		plural: {
			de: 'Bilder',
			en: 'Images'
		},
	},
	// --- upload
	upload: {
		staticURL: '/images',
		//staticDir: 'upload/images',
		staticDir: '../upload/images', // cwd is src
		mimeTypes: ['image/*'],
		imageSizes: [
			{
				name: 'thumbnail',
				width: 400,
				height: 300,
				crop: 'centre',
				formatOptions: {
					...sharpFormatOptions.webp
				}
			},
			{
				name: 'img640',
				width: 640,
				height: undefined,
				// By specifying `undefined` or leaving a height undefined,
				// the image will be sized to a certain width,
				// but it will retain its original aspect ratio
				// and calculate a height automatically.
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
			{
				name: 'img768',
				width: 768,
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
			{
				name: 'img1024',
				width: 1024,
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
			{
				name: 'img1366',
				width: 1366,
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
			{
				name: 'img1600',
				width: 1600,
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
			{
				name: 'img1920',
				width: 1920,
				formatOptions: {
					...sharpFormatOptions.webp
				},
				withoutEnlargement: true,
			},
		],
		formatOptions: {
			...sharpFormatOptions.webp
		},
		resizeOptions: {
			//withoutEnlargement: undefined, // default: uploading images with smaller width AND height than the image size will return null
			withoutEnlargement: true, // if the image is smaller than the image size, return the original image
		},
		adminThumbnail: 'thumbnail',
	},
	//--- access
	access: {
		create: isLoggedIn,
		update: isAdminOrHasCreated,
		read: isAdminOrHasSiteAccess('sites', { allSitesOption: true }),
		delete: isAdminOrHasCreated,
	},
	// --- hooks
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => {
				if (operation === 'create') {
					args = await setFilenameToMd5(args)
				}
				return args
			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation }) => {
				try {
					if (operation === 'create' && req.user && data.authorIsMe === true) {
						// only applies in admin panel
						// automatically insert author
						data.author = `${req.user.firstName} ${req.user.lastName}`
					}

					return data

				} catch (err) {
					log(err.message, user, __filename, 3)
					mailError(err, req)
				}
			},
		],
	},
	// --- admin
	admin: {
		group: 'Upload',
		enableRichTextRelationship: true,
		enableRichTextLink: false,
		useAsTitle: 'alt', // a top-level field
		description: {
			de: 'Hier werden alle Bilder organisiert. Andere Collections können sie dann einbinden. Achtung: Bilder können nur verändert werden von dem Benutzer, der es hochgeladen hat.',
			en: 'Here all images are organized. Other collections may reference them. Attention: Images may only be modified by the user who has uploaded them.'
		},
		listSearchableFields: ['tags'], //  which fields should be searched in the List search view - make sure you index each of these fields so your admin queries can remain performant.
		defaultColumns: ['filename', 'alt', 'tags']
	},
	//--- fields
	fields: [
		// --- img.sites
		{
			type: 'relationship',
			name: 'sites',
			relationTo: 'sites',
			required: true,
			hasMany: true,
			maxDepth: 0,
			defaultValue: ({ user }) => (user && !user?.roles?.includes('admin') && user?.sites?.[0]) ? user.sites[0] : [],
			admin: {
				condition: (data, siblingData, { user }) => (siblingData.allSites === true) ? false : true,
			}
		},
		//--- img.allSites
		{
			type: 'checkbox',
			name: 'allSites',
			label: 'Make available on all sites',
			defaultValue: false,
			admin: {
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
			}
		},
		//--- img.alt
		{
			type: 'text',
			name: 'alt',
			label: {
				de: 'Kurzbeschreibung (alt text)',
				en: 'Short Description (alt text)'
			},
			required: false,
			admin: {
				description: {
					de: 'Dieser Text hilft Menschen mit Sehbehinderung, die einen Screen-Reader verwenden, ebenso wie Suchmaschinen beim analysieren der Seite.',
					en: 'This text will be used for people using screen readers and search engines.'
				},
				condition: (data, siblingData, { user }) => (siblingData.useFileNameForAlt === false) ? true : false
			},
			hooks: {
				beforeValidate: [
					async (args) => {
						try {
							if (args.operation === 'create' && args.data.useFileNameForAlt) {
								return getAltFromFilename(args)
							}
						} catch (err) {
							log(err.stack, user, __filename, 3)
							mailError(err, req)
						}
					},
				]
			}
		},
		// --- img.useFileNameForAlt
		{
			type: 'checkbox',
			name: 'useFileNameForAlt',
			label: {
				de: 'Verwende Dateinamen als Kurzbeschreibung',
				en: 'Use filename for description'
			},
			defaultValue: false,
		},
		// --- img.authorIsMe
		{
			type: 'checkbox',
			name: 'authorIsMe',
			label: {
				de: 'Ich bin der Urheber',
				en: "I'm the Author"
			},
			defaultValue: true,
		},
		// --- img.author
		{
			type: 'text',
			name: 'author',
			label: {
				de: 'Urheber',
				en: 'Author'
			},
			admin: {
				condition: (_, siblingData) => !siblingData.authorIsMe,
				description: 'unsplash.com/@phictionalone'
			}
		},
		// --- img.orgSrc
		{
			type: 'text',
			name: 'orgSrc',
			label: {
				de: 'Originalquelle',
				en: 'Original Source'
			},
			admin: {
				condition: (_, siblingData) => !siblingData.authorIsMe
			}
		},
		// --- img.img.tags
		{
			type: 'relationship',
			relationTo: 'tags',
			name: 'tags',
			label: {
				de: 'Tags',
				en: 'Tags'
			},
			filterOptions: () => {
				// returns a Where query dynamically by the type of relationship
				return {
					relatedCollection: { equals: 'images' },
				}
			},
			hasMany: true,
			index: true,
			admin: {
				position: 'sidebar',
				description: 'z.B. "Header" oder "Produkt-Bilder". Mithilfe dieser Kategorien können die Bilder sortiert und gefiltert werden.'
			},
		},
		// --- img.isLegal
		{
			type: 'checkbox',
			name: 'isLegal',
			label: {
				en: 'The license of this image allows me to use it for this website',
				de: 'Die Lizenz dieses Bildes erlaubt die Verwendung für diese Webseite'
			},
			required: true,
			defaultValue: false,
			admin: {
				condition: (_, siblingData) => !siblingData.authorIsMe
			}
		},
		// --- img.createdByID
		{
			type: 'text',
			name: 'createdByID',
			defaultValue: ({ user }) => (user) ? user.id : '',
			admin: {
				readOnly: true,
				hidden: true,
			}
		},
		// --- img.createdByName
		{
			type: 'text',
			name: 'createdByName',
			label: {
				de: 'Erstellt von Benutzer',
				en: 'Created by User'
			},
			defaultValue: ({ user }) => (user) ? `${user.firstName} ${user.lastName}` : '',
			admin: {
				readOnly: true,
				hidden: true,
			}
		}
	]
}

function getAltFromFilename(args, nameField = 'orgName') {
	// field hook
	// beforeValidate
	const filename = args?.req?.files?.file[nameField] ?? args.data.filename // "aaef873cad9c2eab3fe9d980b2a07184.webp"
	const splits = filename.split('.')
	const ext = `.${splits[splits.length - 1]}`
	return filename.replace(ext, '') // strip off extension
}