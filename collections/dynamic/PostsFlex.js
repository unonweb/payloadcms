import * as React from "react";

/* ACCESS */
import { isLoggedIn } from '../../access/isLoggedIn.js';

/* FIELDS */
import createCommonFields from '../../fields/createCommonFields.js';
import { deployButtonField } from '../../fields/deployButtonField.js';

/* BLOCKS */

/* HOOKS & HELPERS */
import log from '../../helpers/customLog.js';
import createElementsFields from './createPageElementsField.js';
import createAssetsFields from '../../fields/createAssetsFields.js';
import createHTMLFields from '../../fields/createHTMLFields.js';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime.js';
import savePostsJson from '../../hooks/afterOperation/savePostsJson.js';
import copyAssets from '../../hooks/afterChange/copyAssets.js';
import createPostFields from './createPostFields.js';
import getDoc from '../../hooks/getDoc.js';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext.js';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime.js';
import resetBrokenRelationship from '../../hooks/beforeValidate/resetBrokenRelationship.js';
import setHeadHTML from '../../hooks/beforeChange/setHeadHTML.js';
import setPageHTML from '../../hooks/beforeChange/setPageHTML.js';
import savePost from '../../hooks/afterChange/savePost.js';
import setPostHTML from '../../helpers/renderPostHTML.js';
import otherLocaleField from '../../fields/otherLocaleField.js';
import hasSiteAccess from '../../access/hasSiteAccess.js';
import populateContextBeforeVal from '../../hooks/beforeValidate/populateContext.js';

const commonFields = createCommonFields()
const SLUG = 'posts-flex'

export const PostsFlex = {
	slug: SLUG,
	labels: {
		singular: {
			de: 'Post',
			en: 'Post'
		},
		plural: {
			de: 'Posts',
			en: 'Posts'
		},
	},
	admin: {
		enableRichTextRelationship: false, // <-- FIX: Enable this later, when posts are (also) generated as separete html documents that we can link to
		enableRichTextLink: false,
		useAsTitle: 'id',
		defaultColumns: ['id', 'type'],
		listSearchableFields: ['id', 'typeName', 'title'],
		description: {
			de: 'Erstelle einen Post. Dieser kann dann auf einer oder mehreren deiner (Sub)Seiten eingebunden werden. Beispiele für Posts sind: Blog-Artikel, Produkte, Veranstaltungen, Termine,...',
			en: 'Create a new post which can then be included in one or multiple of your pages. Examples for posts are: blog articles, products, events, appointments,...',
		},
		group: {
			de: 'Posts',
			en: 'Posts'
		},
		pagination: {
			defaultLimit: 50,
		},
		hideAPIURL: true,
	},
	versions: false,
	access: {
		create: isLoggedIn,
		update: hasSiteAccess('site'),
		read: hasSiteAccess('site'),
		delete: hasSiteAccess('site'),
	},
	hooks: {
		// --- beforeOperation
		beforeOperation: [
			async ({ args, operation }) => await startConsoleTime(SLUG, { args, operation }),
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		// --- beforeValidate
		beforeValidate: [
			async ({ data, req, operation, originalDoc, context }) => await populateContextBeforeVal({ data, req, originalDoc }, ['sites', 'images', 'documents', 'pages']),
			async ({ data, req, operation, originalDoc, context }) => {
				/* 
					single & bulk user action:
						- data.type === current value
						- originalDoc.type === previous value
				*/
				if (operation === 'create') {
					const type = await getDoc('post-types', data.type, context.user, { depth: 0 }) // when post doc is created get its shape
					data.shape = type.shape
					data.dateStyle = type.dateStyle
					data.typeName = type.name
				}

				if (operation === 'update') {
					if (data.type === null) {
						return null // if post type has been reset
					}
					if (data.type !== undefined && data.type !== originalDoc.type) {
						// if post type has been changed
						const type = await getDoc('post-types', data.type, context.user, { depth: 0 })
						data.shape = type.shape
						data.dateStyle = type.dateStyle
						data.typeName = type.name
					}
				}

				return data
			}
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setHeadHTML({ data, req, context, operation }),
			async ({ data, req, operation, originalDoc, context }) => await setPostHTML({ data, originalDoc, req, context, operation }),
			async ({ data, req, operation, originalDoc, context }) => await setPageHTML({ data, req, operation, context, operation }),
		],
		// --- afterChange
		afterChange: [
			/* 
				Attention:
					Modifications to 'doc' are passed to the admin panel but not to the database 
			*/
			async ({ req, doc, previousDoc, context, operation }) => await copyAssets(['images', 'documents'], { req, doc, context }),
			async ({ req, doc, previousDoc, context, operation }) => await savePost(SLUG, { req, doc, context }),
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await savePostsJson(SLUG, { args, operation, result }),
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
		],
	},
	fields: [
		// SIDEBAR
		otherLocaleField,
		deployButtonField,
		// --- post.site
		{
			type: 'relationship',
			name: 'site',
			relationTo: 'sites',
			hasMany: false,
			index: true,
			required: true,
			maxDepth: 0, // if 1 then for every post the corresponding site is included into the pages collection (surplus data)
			defaultValue: ({ user }) => (user && user.sites?.length === 1) ? user.sites[0] : null,
		},
		// --- post.type
		{
			type: 'relationship',
			relationTo: 'post-types',
			name: 'type',
			label: {
				de: 'Typ',
				en: 'Type'
			},
			hasMany: false,
			localized: false,
			required: true,
			index: true,
			maxDepth: 0,
			admin: {
				description: () => (<span>&#10132; Nach Auswahl oder Änderung des Post-Typs bitte einmal <strong>speichern</strong>!</span>)
			},
			hooks: {
				beforeValidate: [
					async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
						const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value
						if (fieldValue) {
							return await resetBrokenRelationship(fieldValue, { field, context, collection })
						}
					}
				]
			},
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
			required: false,
			index: true,
			maxDepth: 1,
			// * if set to 1 then bulk operations include the entire doc in 'originalDoc'
			// * if changed renderHTMLFromBlocks has to be changed, too
			admin: {
				description: {
					de: 'Mithilfe von Tags können Post auf der Website von den Besuchern sortiert und gefiltert werden.',
					en: 'With tags visitors of your website may sort and filter posts.'
				},
				disableBulkEdit: false,
			},
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
			admin: {
				condition: (data) => (data.shape && data.shape.length > 0) ? true : false,
			},
		},
		// --- post.elements
		// --- post.elements.header
		// --- post.elements.nav
		// --- post.elements.footer
		createElementsFields(),
		// --- createPostFields()
		{
			type: 'collapsible',
			label: {
				de: 'Inhalt',
				en: 'Content'
			},
			admin: {
				condition: (data) => (data.shape && data.shape.length > 0) ? true : false,
			},
			fields: createPostFields(),
		},
		// --- post.html
		// --- post.html.main
		// --- post.html.page
		createHTMLFields('head', 'main', 'page'),
		// --- post.assets
		// --- post.assets.imgs
		// --- post.assets.docs
		// --- post.assets.head
		createAssetsFields('imgs', 'docs', 'head'),
		// --- post.shape
		{
			type: 'json',
			name: 'shape',
			defaultValue: [],
			admin: {
				hidden: true,
				readOnly: true // set by post-type
			},
		},
		// --- post.dateStyle
		{
			type: 'text',
			name: 'dateStyle',
			admin: {
				hidden: true,
				readOnly: true // set by post-type
			},
		},
		// --- post.typeName
		{
			type: 'text',
			name: 'typeName',
			label: {
				de: 'Typ',
				en: 'Type'
			},
			localized: false,
			index: true,
			admin: {
				hidden: true,
				readOnly: true // set by post-type
			},
		},
		// --- commonFields
		...commonFields,
	],
}