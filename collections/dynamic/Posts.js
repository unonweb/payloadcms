/* ACCESS */
import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';

/* FIELDS */
import editingModeField from '../../fields/editingMode';
import createCommonFields from '../../fields/createCommonFields';

/* BLOCKS */
import createRichTextBlock from '../../blocks/rich-text-block';
import createUnImgBlock from '../../blocks/img/un-img';

/* HOOKS & HELPERS */
import log from '../../customLog';
import getDoc from '../../hooks/getDoc';
import createElementsFields from './createPageElementsField';
import createAssetsFields from '../../fields/createAssetsFields';
import createHTMLFields from '../../fields/createHTMLFields';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import savePostsJson from '../../hooks/afterOperation/savePostsJson';
import copyAssets from '../../hooks/afterChange/copyAssets';
import initOtherLocaleField from '../../fields/initOtherLocaleField';
import populateContextBeforeVal from '../../hooks/beforeValidate/populateContext';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import setPageHTML from '../../hooks/beforeChange/setPageHTML';
import setHeadHTML from '../../hooks/beforeChange/setHeadHTML';
import savePost from '../../hooks/afterChange/savePost';

const SLUG = 'posts'
const commonFields = createCommonFields()

export const Posts = {
	slug: SLUG,
	admin: {
		enableRichTextRelationship: false, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: false,
		useAsTitle: 'title',
		defaultColumns: [
			'title',
			'updatedAt',
			'tags'
		],
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
		create: isLoggedIn,
		update: isAdminOrHasSiteAccess('site'),
		read: isAdminOrHasSiteAccess('site'),
		delete: isAdminOrHasSiteAccess('site'),
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => await startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages'])
		],
		// --- beforeValidate
		beforeValidate: [
			async ({ data, req, operation, originalDoc }) => await populateContextBeforeVal({ data, req })
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setHeadHTML({ data, req, context }),
			// data.html.main
			async ({ data, req, operation, originalDoc, context }) => await setPageHTML({ data, req, operation, originalDoc, context }),

		],
		// --- afterChange
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => await copyAssets(['images', 'documents'], { req, doc, previousDoc, context, operation }),
			async ({ req, doc, previousDoc, context, operation }) => await savePost(SLUG, { req, doc, context }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await savePostsJson(SLUG, { args, operation, result }),
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
		],
	},
	fields: [
		// --- SIDEBAR
		// --- editingMode
		editingModeField,
		initOtherLocaleField,
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
						// --- post.tags
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
									relatedCollection: { equals: SLUG },
								}
							},
							hasMany: true,
							localized: false,
							required: true,
							index: true,
							maxDepth: 1,
							// * if set to 1 then bulk operations include the entire doc in 'originalDoc'
							// * if changed renderHTMLFromBlocks has to be changed, too
							admin: {
								description: {
									de: 'Ein Posts kann mithilfe von Tags in eine oder mehrere deiner Sub(Seiten) eingebunden werden.',
									en: 'By the means of tags a post may be included in one or multiple pages.'
								},
								disableBulkEdit: false, // must be disabled if updatePostCategories() is used
							},
							/* hooks: {
								afterChange: [
									async (args) => {
										try {
											//await updatePostCategories(args)
										} catch (err) {
											reportError(err, args.req)
										}
									},
								]
							} */
						},
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
									type: 'date',
									name: 'date',
									label: {
										de: 'Datum (Beginn)',
										en: 'Date (Begin)'
									},
									localized: false,
									defaultValue: () => new Date(),
									admin: {
										date: {
											pickerAppearance: 'dayOnly',
											displayFormat: 'd.MM.yyyy'
										},
										width: '30%'
									}
								},
								// --- post.time
								{
									type: 'date',
									name: 'time',
									label: {
										de: 'Uhrzeit',
										en: 'Time'
									},
									localized: false,
									admin: {
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
								/* {
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
								}, */
							]
						},
						// --- post.img
						{
							type: 'upload',
							name: 'img',
							label: {
								en: 'Featured Image',
								de: 'Meta-Bild'
							},
							relationTo: 'images',
							required: false,
							localized: false,
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
						// --- post.header
						// --- post.nav
						// --- post.footer
						createElementsFields(),
						// post.html
						createHTMLFields('head', 'main', 'page'),
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
						// --- post.blocks
						{
							type: 'blocks',
							name: 'blocks',
							label: {
								en: 'Content',
								de: 'Inhalt'
							},
							labels: {
								singular: 'Contents',
								plural: 'Inhalte',
							},
							blocks: [
								createRichTextBlock(),
								createUnImgBlock(['caption', 'size', 'link']),
							]
						},
					]
				},
			]
		},
		// --- COMMON FIELDS
		...commonFields
	],
}

function addSlug(args) {
	// afterRead 
	// field hook

	try {
		if (args.data.title) {
			return `${slugify(args.data.title)}`
		} else {
			return args.value
			//throw ReferenceError('args.data.title not set.')
		}
	} catch (error) {
		console.error(error)
	}
}

function addURLSlug(args) {
	// field hook
	// beforeValidate
	try {
		if (args.data.title) {
			return `/posts/${slugify(args.data.title)}`
		} else {
			return args.value
			//throw ReferenceError('args.data.title not set.')
		}
	} catch (error) {
		console.error(error)
	}
}

function slugify(str) {
	str = str.replace(/^\s+|\s+$/g, '');

	// Make the string lowercase
	str = str.toLowerCase();

	// Remove accents, swap ñ for n, etc
	var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
	var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	// Remove invalid chars
	str = str.replace(/[^a-z0-9 -]/g, '')
		// Collapse whitespace and replace by -
		.replace(/\s+/g, '-')
		// Collapse dashes
		.replace(/-+/g, '-');

	return str;
}

async function getAffectedPageIDs(doc, user) {
	/* mechanism:
	 1. A post is associated with one or more post-categories [ 'blog', 'publications' ]
	 2. A page includes one or more post-categories with the 'includePosts' block
		  - When doing so a reference to that page is saved in the corresponding post-categories in the 'relPages' field
	 3. After changing a post, that post queries its associated categories in order to get the affected pages 
	*/

	let affectedPageIDs = []

	for (let i = 0; i < meta.tags.length; i++) {
		// go through all categories associated with this post

		if (typeof doc.tags[i] === 'string') {
			doc.tags[i] = await getDoc('posts-categories', doc.tags[i], user) // get full post-categories relationship data
		}

		for (const relPageID of doc.tags[i].relPages) {
			// go through related Pages within each postCategory
			if (!affectedPageIDs.includes(relPageID)) {
				affectedPageIDs.push(relPageID) // add pageID if it's not in the array yet
			}
		}

	}

	return affectedPageIDs
}

async function addFullRelationshipData(doc = {}, relField = '', destCol = '', locale = '', user = '') {

	for (let i = 0; i < doc[relField].length; i++) {
		// go through all categories associated with this post
		if (typeof doc[relField][i] === 'string') {
			doc[relField][i] = await getDoc(destCol, doc[relField][i], user, { locale: locale }) // get full relationship data
		}
	}

	return doc
}