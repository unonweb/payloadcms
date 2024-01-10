export default async function updatePostCategories(args) {

	// not used currently !!!

	// afterChange field hook
	// src collection: 'posts'
	// src field: 'categories'
	// destination collection: 'posts-categories'
	// destination field: 'relPosts'

	// updates the postCategories collection with referenced posts
	// ISSUES:
	// * when a post is deleted the reference in 'post-categories' is broken
	// * bulk operation not working and must remain disabled
	
	const postID = args.originalDoc.id ?? args.originalDoc._id

	if (args.operation === 'create') {
		for (const catID of args.originalDoc.categories) {
			await updateDocSingle('posts-categories', catID, { 'relPosts': `add ${postID}` }, args.req.user.shortName)	
		}
	}

	if (args.operation === 'update') {
		// just return if nothing has changed
		if (args.originalDoc.categories.length === 0 && args.previousDoc.categories.length === 0) {
			return
		}
		if (args.originalDoc.categories.toString() === args.previousDoc.categories.toString()) {
			return
		}
		// if something has changed
		let catsAdded = args.originalDoc.categories.filter(cat => !args.previousDoc.categories.includes(cat)) // get the postCategories are included now but not in the previous version
		let catsRemoved = args.previousDoc.categories.filter(cat => !args.originalDoc.categories.includes(cat)) // get the postCategories that are not included any more

		if (catsAdded.length > 0) {
			// add
			for (const catID of catsAdded) {
				await updateDocSingle('posts-categories', catID, { 'relPosts': `add ${postID}` }, args.req.user.shortName)
			}
		}

		if (catsRemoved.length > 0) {
			// remove
			// get the categories that were used in the previous version but not in the current version
			for (const catID of catsRemoved) {
				await updateDocSingle('posts-categories', catID, { 'relPosts': `remove ${postID}` }, args.req.user.shortName)
			}
		}
	}
}