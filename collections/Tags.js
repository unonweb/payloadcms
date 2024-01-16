import isAdminOrHasSiteAccess from "../access/isAdminOrHasSiteAccess";
import { isLoggedIn } from "../access/isLoggedIn";

export const Tags = {
	slug: 'tags',
	labels: {
		singular: {
			de: 'Schlagwort',
			en: 'Tag'
		},
		plural: {
			de: 'Tags',
			en: 'Tags'
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
	},
	access: {
		create: isLoggedIn,
		update: isAdminOrHasSiteAccess('sites'),
		read: isAdminOrHasSiteAccess('sites', { allSitesOption: true }),
		delete: isAdminOrHasSiteAccess('sites'),
	},
	fields: [
		// --- tag.sites
		{
			type: 'relationship',
			relationTo: 'sites',
			name: 'sites',
			required: true,
			hasMany: true,
			maxDepth: 0,
			// If user is not admin, set the site by default
			// to the first site that they have access to
			defaultValue: ({ user }) => (user && !user.roles.includes('admin') && user.sites?.[0]) ? user.sites[0] : [],
			admin: {
				condition: (data, siblingData, { user }) => (siblingData.allSites === true) ? false : true,
			}
		},
		//--- tag.allSites
		{
			type: 'checkbox',
			name: 'allSites',
			label: 'Make available on all sites',
			defaultValue: false,
			admin: {
				condition: (data, siblingData, { user }) => (user && user?.roles?.includes('admin')) ? true : false,
			}
		},
		// --- tag.relatedCollection
		{
			name: 'relatedCollection',
			type: 'select',
			hasMany: false,
			required: true,
			options: [
				{
					label: 'Images',
					value: 'images'
				},
				{
					label: 'Pages',
					value: 'pages',
				},
				{
					label: 'Posts',
					value: 'posts'
				},
				{
					label: 'Events',
					value: 'events'
				},
				{
					label: 'Libraries',
					value: 'lib'
				},
			],
		},
		// --- tag.name
		{
			type: 'text',
			name: 'name',
			label: 'Name',
			required: true,
			localized: true,
		},
		// --- tag.img
		{
			type: 'upload',
			name: 'img',
			label: {
				en: 'Thumbnail / Icon',
				de: 'Thumbnail / Icon'
			},
			relationTo: 'images',
			required: false,
		},
		// --- tag.createdByID
		{
			type: 'relationship',
			relationTo: 'users',
			name: 'createdByID',
			maxDepth: 0,
			hasMany: false,
			defaultValue: ({ user }) => (user) ? user.id : '',
			admin: {
				condition: (data, siblingData, { user }) => user && user.roles.includes('admin'),
			},
		},
		// --- tag.createdByName
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
		/* // --- tag.relPages
		// set by includePosts (block) when a page includes a post category it stores it's ID here for reference
		// queried by Posts (collection) in a afterChange hook in order to update (only!) the pages affected by changes in a post
		{
			type: 'relationship',
			name: 'relPages',
			relationTo: 'pages',
			maxDepth: 0, // prevents that the whole page is going to be included
			hasMany: true,
			label: {
				de: 'Verwendet auf folgenden Seiten:',
				en: 'Used on the following pages:'
			},
			admin: {
				readOnly: true
			},
		}, */
		// --- relPosts
		// set by the Posts collection when a post is associated with a category
		/* {
			type: 'relationship',
			relationTo: 'posts',
			name: 'relPosts',
			maxDepth: 0, // prevent that the whole post is going to be included
			hasMany: true,
			label: {
				de: 'Assoziiert mit folgenden Posts:',
				en: 'Associated with the following posts:'
			},
			admin: {
				readOnly: true
			},
			hooks: {
				beforeChange: [
					async (args) => {
						
						let relPosts = args.originalDoc.relPosts

						const op = args.value.split(' ')[0]
						const postID = args.value.split(' ')[1]

						switch (op) {
							case 'add':
								if (!args.originalDoc.relPosts.includes(postID)) {
									relPosts.push(postID) // add if not present already
								}	
								break;
							case 'remove':
								relPosts = relPosts.filter(id => id !== postID)
								break;
							default:
								throw new CustomError('unhandled case', args?.req?.user?.shortName, __filename)
						}

						return relPosts
					}
				]
			}
		} */
	],
}