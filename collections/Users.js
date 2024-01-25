/* ACCESS */
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin';
import { isAdminOrSelf } from '../access/isAdminOrSelf';

// HOOKS
import updateDocSingle from '../hooks/updateDocSingle';
import log from '../customLog';
import mailError from '../mailError';
import cleanUpSite from '../hooks/cleanUpSite'
import getRelatedDoc from '../hooks/getRelatedDoc';
import spawnCmd from '../hooks/_spawnCmd';

// VARIABLES
const authTokenExpiration = 60 * 20 // 20 minutes

export const Users = {
	slug: 'users',
	labels: {
		singular: {
			de: 'Benutzer',
			en: 'User'
		},
		plural: {
			de: 'Benutzer',
			en: 'Users'
		},
	},
	auth: {
		// This property controls how deeply "populated"
		// relationship docs are that are stored in the req.user.
		// It should be kept to as low as possible, which 
		// keeps performance fast.
		depth: 0,
		useAPIKey: false,
		tokenExpiration: authTokenExpiration, // seconds (default 2h)
		maxLoginAttempts: 5,
		lockTime: 1000 * 60 * 5, // 5 minutes
		cookies: {
			//domain: 'localhost', // specifies which hosts can receive a cookie; if specified, then subdomains are always included
			sameSite: 'lax', // specify whether/when cookies are sent with cross-site requests; 
			// 'strict' only sends the cookie with requests from the cookie's origin site
			secure: false // the cookie should be transferred only over HTTPS. 
		},
	},
	admin: {
		useAsTitle: 'email',
		group: {
			de: 'Admin',
			en: 'Admin'
		},
		hideAPIURL: true,
		enableRichTextLink: false,
		enableRichTextRelationship: false,
	},
	access: {
		create: isAdmin,
		read: isAdminOrSelf,
		update: isAdminOrSelf,
		delete: isAdmin,
	},
	hooks: {
		afterLogin: [
			async ({ req, user }) => {
				try {
					log(`--- login ${user.shortName} ---`, user.shortName, __filename, 7)

					if (user?.sites) {
						for (let site of user.sites) {
							site = await getRelatedDoc('sites', site, user.shortName)
							await cleanUpSite(site, user.shortName)
						}	
					}
				} catch (err) {
					log(err.stack, user, __filename, 3)
					mailError(err, req)
				}
			}
		],
		// --- afterLogout
		afterLogout: [
			async ({ req }) => {
				try {
					log(`--- logout ${req.user.shortName} ---`, req.user.shortName, __filename, 7)
					
					if (req?.user?.sites) {
						for (let site of req.user.sites) {
							site = await getRelatedDoc('sites', site, req.user.shortName)
							await cleanUpSite(site, req.user.shortName)
							spawnCmd('npx', ['-g', 'netlify', 'deploy', '--prod', '--auth', 'nfp_oEkc5bNNLWFDckQLS5xyTcrNzChCqnUi8ce4', '--site', 'haerer-geruestbau', '--dir', site.paths.fs.site], req.user.shortName)
						}
					}
					
				} catch (err) {
					log(err.stack, req.user.shortName, __filename, 3)
					mailError(err, req)
				}
			}
		],
		// --- afterRefresh
		afterRefresh: [
			async ({ req }) => {
				try {
					const user = req?.user?.shortName ?? 'internal'
					log('refresh', user, __filename)
				} catch (err) {
					log(err.stack, req?.user?.shortName, __filename, 3)
					mailError(err, req)
				}
			}
		],
	},
	fields: [
		// --- firstName, lastName, shortName
		{
			type: 'row',
			fields: [
				// --- user.firstName
				{
					type: 'text',
					name: 'firstName',
					label: {
						en: 'First Name',
						de: 'Vorname'
					},
					required: true,
				},
				// --- user.lastName
				{
					type: 'text',
					name: 'lastName',
					label: {
						en: 'Last Name',
						de: 'Nachname'
					},
					required: true,
				},
				// --- user.shortName
				{
					type: 'text',
					name: 'shortName',
					label: {
						en: 'Short Name',
					},
					admin: {
						readOnly: true,
					},
					hooks: {
						beforeValidate: [
							(args) => {
								if (!args.value) {
									const firstName = args?.data?.firstName ?? args.originalDoc.firstName
									const lastName = args?.data?.lastName ?? args.originalDoc.lastName
									let shortName = `${firstName[0]}${lastName}`
									return shortName.replaceAll('ö', 'oe').replaceAll('ä', 'ae').replaceAll('ü', 'ue').replaceAll(' ', '').toLowerCase()
								}
							}
						]
					}
				},
			],
		},
		// --- user.roles
		{
			type: 'select',
			name: 'roles',
			label: {
				en: 'Roles',
				de: 'Rollen'
			},
			saveToJWT: true, // Save this field to JWT so we can use from `req.user`
			hasMany: true,
			defaultValue: ['editor'],
			access: {
				// Only admins can create or update a value for this field
				create: isAdminFieldLevel,
				update: isAdminFieldLevel,
			},
			options: [
				{
					label: 'Admin',
					value: 'admin',
				},
				{
					label: 'Editor',
					value: 'editor',
				},
			]
		},
		// --- user.sites
		{
			type: 'relationship',
			name: 'sites',
			relationTo: 'sites',
			saveToJWT: true, // save this field to JWT so we can use from req.user
			hasMany: true,
			required: false,
			access: {
				// Only admins can create or update a value for this field
				create: isAdminFieldLevel,
				update: isAdminFieldLevel,
			},
			admin: {
				//condition: ({ roles }) => roles && !roles.includes('admin'), // only show if not admin
				description: 'This field sets which sites that this user has access to.'
			}
		},
	],
};

function updateTokenExpires(userID) {
	// called afterLogin
	// called afterRefresh
	let tokenExpires = Date.now() + (authTokenExpiration * 1000)
	console.log('tokenExpires: ', new Date(tokenExpires))
	updateDocSingle('users', userID, userID, { data: { tokenExpires: tokenExpires } })
}