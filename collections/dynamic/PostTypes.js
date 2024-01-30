import isAdminOrHasSiteAccess from '../../access/isAdminOrHasSiteAccess';
import { isLoggedIn } from '../../access/isLoggedIn';
import updateDocsMany from '../../hooks/updateDocsMany';
import startConsoleTime from '../../hooks/beforeOperation/startConsoleTime';
import populateContextBeforeVal from '../../hooks/beforeValidate/populateContext';
import createPostFields from './createPostFields';
import populateContextBeforeOp from '../../hooks/beforeOperation/populateContext';
import endConsoleTime from '../../hooks/afterOperation/endConsoleTime';
import removeRelations from '../../hooks/afterDelete/rmRelations';
import log from '../../customLog';

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
			de: 'Dynamische Inhalte',
			en: 'Dynamic Content'
		},
		description: {
			de: 'Es werden Tags angezeigt, die man selbst erstellt hat. Außerdem Tags, die der Admin erstellt hat.',
			en: 'Only Tags are shown created by the user himself/herself. Additionally tags created by the admin are shown.'
		},
		enableRichTextLink: false,
		enableRichTextRelationship: false,
		hidden: ({ user}) => !['unonner'].includes(user.shortName)
	},
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
		// --- beforeValidate
		beforeValidate: [
			async ({ data, req, operation, originalDoc }) => await populateContextBeforeVal({ data, req })
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
			//defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : null,
		},
		// --- postType.name
		{
			type: 'text',
			name: 'name',
			label: 'Name',
			required: true,
			localized: true,
		},
		// --- postType.shape
		{
			type: 'select',
			name: 'shape',
			hasMany: true,
			options: [
				'title',
				'subtitle',
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
			hooks: {
				afterChange: [
					async ({ value, previousValue, originalDoc, operation, context, req }) => {
						if (operation === 'update') {
							try {
								// update docs that reference this doc with new 'shape' value
								await updateDocsMany('posts-flex', context.user, {
									where: {
										and: [
											{ site: { equals: context.site.id } },
											{ type: { equals: originalDoc.id } },
										]
									},
									data: {
										shape: value
									},
									context: {
										preventFsOps: true,
										...context,
									}
								})
							} catch (error) {
								log(error.stack, context.user, __filename, 3)
							}

						}
					}
				]
			},
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
		// --- postType.html
		{
			type: 'code',
			name: 'html',
			localized: false,
			admin: {
				language: 'html',
			},
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