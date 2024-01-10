export default function isAdminOrHasSiteAccess(siteFieldName = 'site', { allSitesOption = false } = {}) {

	return function ({ req: { user } }) {
		// is admin or is associated with this site
		if (user) {
			if (user.roles.includes('admin')) {
				return true
			}
			if (user.roles.includes('editor') && user.sites?.length > 0) {
				let query = {
					or: []
				}

				if (allSitesOption === true) {
					// only enable this on collections that use this field
					// unless this breaks collections that don't have it
					query.or.push({
						allSites: { equals: true } // allow read access it the image is shared with everybody
					})	
				}
				
				if (siteFieldName === 'site') {
					query.or.push({
						site: { in: user.sites }
					})
					query.or.push({
						site: { exists: false } // return docs that are not assigned to any site
					})
				}

				if (siteFieldName === 'sites') {
					for (let site of user.sites) { // allow read access if the image's associated sites contain at least ONE of the MANY user's sites
						query.or.push({
							sites: { contains: site } // <-- ATT! site needs to be an id string
						})
					}
				}

				return query // return a query constraint which limits the documents that are returned to only those that match the constraint you provide.
			}
		} else {
			return false
		}
	}
}