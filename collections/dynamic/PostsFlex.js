import * as React from "react";

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
import createElementsFields from './createPageElementsField';
import createAssetsFields from '../../fields/createAssetsFields';
import createHTMLFields from '../../fields/createHTMLFields';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import savePostsJson from '../../hooks/afterOperation/savePostsJson';
import copyAssets from '../../hooks/afterChange/copyAssets';
import initOtherLocaleField from '../../fields/initOtherLocaleField';
import populateContextBeforeVal from '../../hooks/beforeValidate/populateContext';
import createPostFields, { postFields } from './createPostFields';
import getDoc from '../../hooks/getDoc';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import resetBrokenRelationship from '../../hooks/beforeValidate/resetBrokenRelationship';
import setHeadHTML from '../../hooks/beforeChange/setHeadHTML';
import setPageHTML from '../../hooks/beforeChange/setPageHTML';
import savePost from '../../hooks/afterChange/savePost';
import iterateBlocks from '../../hooks/iterateBlocks';
import getPosSubset from '../../helpers/getPosSubset';
import setPostHTML from '../../helpers/renderPostHTML';
import otherLocaleField from '../../fields/otherLocaleField';

const commonFields = createCommonFields()
const SLUG = 'posts-flex'

export const PostsFlex = {
	slug: SLUG,
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
			defaultLimit: 50,
		},
		hideAPIURL: true,
		hidden: ({ user}) => !['unonner'].includes(user.shortName)
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
			async ({ args, operation }) => await populateContextBeforeOp({ args, operation }, ['sites', 'images', 'documents', 'pages']),
		],
		// --- beforeChange
		beforeChange: [
			async ({ data, req, operation, originalDoc, context }) => await setHeadHTML({ data, req, context }),
			async ({ data, req, operation, originalDoc, context }) => await setPostHTML({ data, originalDoc, req, context }),
			async ({ data, req, operation, originalDoc, context }) => await setPageHTML({ data, req, operation, context }),
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
		// --- editingMode
		editingModeField,
		//initOtherLocaleField,
		otherLocaleField,
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
			relationTo: 'post-types',
			name: 'type',
			label: {
				de: 'Type',
				en: 'Typ'
			},
			hasMany: false,
			localized: false,
			required: false,
			index: false,
			admin: {
				description: () => (<span>&#10132; Nach Auswahl des Post-Typs bitte einmal <strong>speichern</strong>!</span>)
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
		// post.html
		createHTMLFields('head', 'main', 'page'),
		// --- post.assets
		createAssetsFields('imgs', 'docs', 'head'),
		// --- post.shape
		{
			type: 'json',
			name: 'shape',
			defaultValue: [],
			admin: {
				condition: (data, siblingData, { user }) => (user && user.roles.includes('admin')) ? true : false,
			},
			hooks: {
				beforeValidate: [
					async ({ data, originalDoc, siblingData, operation, value, field, context, collection, req }) => {
						if (operation === 'create') {
							const type = await getDoc('post-types', data.type, context.user, { depth: 0 })
							return type.shape
						}
						if (operation === 'update') {
							if (data.type === null) {
								// if post type has been reset
								return null
							}
							if (data.type !== undefined && data.type !== originalDoc.type) {
								// if post type has been changed
								const type = await getDoc('post-types', data.type, context.user, { depth: 0 })
								return type.shape
							}

						}
					}
				]
			}
		},
		// --- commonFields
		...commonFields,
	],
}