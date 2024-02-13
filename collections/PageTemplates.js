import updateDocsMany from '../hooks/updateDocsMany.js';
import startConsoleTime from '../hooks/beforeOperation/startConsoleTime.js';
import populateContextBeforeVal from '../hooks/beforeValidate/populateContext.js';
import createPostFields from './dynamic/createPostFields.js';
import populateContextBeforeOp from '../hooks/beforeOperation/populateContext.js';
import endConsoleTime from '../hooks/afterOperation/endConsoleTime.js';
import removeRelations from '../hooks/afterDelete/rmRelations.js';
import log from '../helpers/customLog.js';
import hasSiteAccess from '../access/hasSiteAccess.js';
import isUnique from '../hooks/validate/isUnique.js';
import { isAdmin } from '../access/isAdmin.js';
import createPageTemplateFields from '../fields/createPageTemplateFields.js';

const SLUG = 'page-templates'

export const PageTemplates = {
	slug: SLUG,
	labels: {
		singular: {
			de: 'Template',
			en: 'Template'
		},
		plural: {
			de: 'Templates',
			en: 'Templates'
		},
	},
	admin: {
		useAsTitle: 'name',
		group: {
			de: 'Pages',
			en: 'Pages'
		},
		enableRichTextLink: false,
		enableRichTextRelationship: false,
		hidden: ({ user }) => !['unonner'].includes(user.shortName)
	},
	access: {
		create: isAdmin,
		update: isAdmin,
		read: hasSiteAccess('site'),
		delete: isAdmin,
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
							await updateDocsMany('pages', context.user, {
								locale: loc,
								where: {
									and: [
										{ site: { equals: context.site.id } },
										{ template: { equals: doc.id } },
									]
								},
								data: {
									shape: doc.shape,
									dateStyle: doc.dateStyle,
									templateName: doc.name,
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
			async ({ req, id, doc }) => await removeRelations('pages', 'template', { req, id })
		],
		// --- afterOperation
		afterOperation: [
			async ({ args, operation, result }) => await endConsoleTime(SLUG, { args, operation }),
		],
	},
	fields: [
		// --- pageTemplate.site
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
		// --- pageTemplate.name
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
		// --- pageTemplate.shape
		{
			type: 'select',
			name: 'shape',
			hasMany: true,
			localized: false,
			options: [
				'title',
				'posts',
				'img_featured',
				'richText',
			],
			defaultValue: ['title', 'richText']
		},
		// --- pageTemplate.createPageTemplateFields()
		{
			type: 'collapsible',
			label: {
				de: 'Felder',
				en: 'Fields'
			},
			fields: createPageTemplateFields(),
		},
		// --- pageTemplate.createdByID
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
		// --- pageTemplate.createdByName
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