import { isLoggedIn } from '../../access/isLoggedIn.js';
import updateDocsMany from '../../hooks/updateDocsMany.js';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime.js';
import populateContextBeforeVal from '../../hooks/beforeValidate/populateContext.js';
import createPostFields from './createPostFields.js';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext.js';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime.js';
import removeRelations from '../../hooks/afterDelete/rmRelations.js';
import log from '../../helpers/customLog.js';
import hasSiteAccess from '../../access/hasSiteAccess.js';
import isUnique from '../../hooks/validate/isUnique.js';

const SLUG = 'post-types'

export const PostTypes = {
	slug: SLUG,
	labels: {
		singular: {
			de: 'Typ',
			en: 'Type'
		},
		plural: {
			de: 'Typen',
			en: 'Types'
		},
	},
	admin: {
		useAsTitle: 'name',
		group: {
			de: 'Posts',
			en: 'Posts'
		},
		description: {
			de: 'Es werden Tags angezeigt, die man selbst erstellt hat. Außerdem Tags, die der Admin erstellt hat.',
			en: 'Only Tags are shown created by the user himself/herself. Additionally tags created by the admin are shown.'
		},
		enableRichTextLink: false,
		enableRichTextRelationship: false,
		hidden: ({ user }) => !['unonner'].includes(user.shortName)
	},
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
			async ({ data, req, operation, originalDoc }) => await populateContextBeforeVal({ data, req }, ['sites', 'images', 'documents', 'pages'])
		],
		afterChange: [
			async ({ req, doc, previousDoc, context, operation }) => {
				try {
					if (operation === 'update') {
						// update docs that reference this doc
						for (const loc of context.site.locales.used) {
							await updateDocsMany('posts-flex', context.user, {
								locale: loc,
								where: {
									and: [
										{ site: { equals: context.site.id } },
										{ type: { equals: doc.id } },
									]
								},
								data: {
									shape: doc.shape,
									dateStyle: doc.dateStyle,
									typeName: doc.name,
								},
								context: {
									preventFsOps: false,
									...context,
								}
							})	
						}
					}
				} catch (error) {
					log(error.stack, context.user, __filename, 3)
				}
			}
		],
		// --- afterDelete
		afterDelete: [
			async ({ req, id, doc }) => await removeRelations('posts-flex', 'type', { req, id })
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
		],
	},
	fields: [
		// --- postType.site
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
		// --- postType.name
		{
			type: 'text',
			name: 'name',
			label: 'Name',
			required: true,
			localized: false,
			admin: {
				description: "Don't change! If you do you need to adapt a) the path of the template rendering function and b) the corresponding css"
			},
			validate: async (val, { data, payload, user, siblingData, id }) => await isUnique(SLUG, 'name', val, { data, payload }),
		},
		// --- postType.shape
		{
			type: 'select',
			name: 'shape',
			hasMany: true,
			localized: false,
			options: [
				'title',
				//'title_noloc',
				'subtitle',
				//'subtitle_noloc',
				'description',
				'date_start',
				'date_end',
				'date_time',
				'img_featured',
				'richText',
				'location_name',
				'location_url',
				'location_coords',
				'artists'
			],
			defaultValue: ['title', 'date_start', 'richText']
		},
		// --- postType.dateStyle
		{
			type: 'select',
			name: 'dateStyle',
			label: {
				de: 'Datumsformat',
				en: 'Date Style'
			},
			admin: {
				condition: (data, siblingData) => (Array.isArray(data.shape) && data.shape.join().includes('date')) ? true : false,
			},
			options: [
				{
					value: 'short',
					label: {
						de: '22.05.23',
						en: '5/22/23'
					}
				},
				{
					value: 'long',
					label: {
						de: '22. Mai 2023',
						en: 'May 22, 2023'
					}
				},
				{
					value: 'full',
					label: {
						de: 'Montag, 22. Mai 2023',
						en: 'Monday, May 22, 2023'
					}
				},
				{
					value: 'year',
					label: {
						de: '2023',
						en: '2023'
					}
				},
			],
			defaultValue: 'short',
		},
		// --- createPostFields()
		{
			type: 'collapsible',
			label: {
				de: 'Felder',
				en: 'Fields'
			},
			fields: createPostFields({ readOnly: true }),
		},
		// --- postType.createdByID
		{
			type: 'relationship',
			relationTo: 'users',
			name: 'createdByID',
			maxDepth: 0,
			hasMany: false,
			defaultValue: ({ user }) => (user) ? user.id : null,
			admin: {
				hidden: true,
			},
		},
		// --- postType.createdByName
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
	],
}