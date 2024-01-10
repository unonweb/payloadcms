import { isAdmin } from '../access/isAdmin'
import updateDocsMany from '../hooks/updateDocsMany'
import log from '../customLog'
import mailError from '../mailError'
import hasChanged from '../hooks/_hasChanged'

const Admin = {
	slug: 'admin',
	labels: {
		singular: {
			de: 'Admin (global)',
			en: 'Admin (global)'
		},
		plural: {
			de: 'Admin (global)',
			en: 'Admin (global)'
		},
	},
	admin: {
		group: {
			de: 'Admin',
			en: 'Admin'
		},
	},
	access: {
		update: isAdmin,
		read: isAdmin,
	},
	hooks: {
		afterChange: [
			async ({ doc, previousDoc, req }) => {
				// no operation property available in globals
				try {
					const user = req?.user?.shortName ?? 'internal'
					// updates 'site.paths.fs.sites' in all sites
					// in turn for each site on update on all paths is triggerd
					await updateDocsMany('sites', user, {
						data: {
							paths: {
								fs: {
									admin: {
										sites: doc.paths.fs.sites,
										resources: doc.paths.fs.resources,
										customElements: doc.paths.fs.customElements,
									}
								},
								web: {
									admin: {
										resources: doc.paths.web.resources,
										customElements: doc.paths.web.customElements,
									}
								}
							},
						}
					})

				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err)
				}
			}
		]
	},
	fields: [
		// --- admin.paths
		{
			type: 'group',
			name: 'paths',
			admin: {
				description: 'Absolute paths without trailing slash',
			},
			fields: [
				// --- admin.paths.fs
				{
					type: 'group',
					name: 'fs',
					fields: [
						// --- admin.paths.fs.sites
						{
							type: 'text',
							name: 'sites',
							label: 'admin.paths.fs.sites',
							defaultValue: '/home/payload/sites',
						},
						// --- admin.paths.fs.resources
						{
							type: 'text',
							name: 'resources',
							label: 'admin.paths.fs.resources',
							defaultValue: '/srv/web/resources',
						},
						// --- admin.paths.fs.customElements
						{
							type: 'text',
							name: 'customElements',
							label: 'admin.paths.fs.customElements',
							defaultValue: '/srv/web/resources/custom-elements',
						},
					]
				},
				// --- admin.paths.web
				{
					type: 'group',
					name: 'web',
					fields: [
						// --- admin.paths.web.resources
						{
							type: 'text',
							name: 'resources',
							label: 'admin.paths.web.resources',
							defaultValue: 'https://resources.unonweb.local',
						},
						// --- admin.paths.web.customElements
						{
							type: 'text',
							name: 'customElements',
							label: 'admin.paths.web.resources',
							defaultValue: 'https://resources.unonweb.local/custom-elements/prod',
						},
					]
				},
			]
		},
	],
}

export default Admin