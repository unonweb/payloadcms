import payload from 'payload'
import getUserSites from '../getUserSites'
import getAppMode from '../_getAppMode'
import log from '../../customLog'

export default async function populateContextBeforeOp({ args, operation }, collections = ['sites']) {
	/* 
		Hook:
			beforeOperation
		Order:
			Is called by the collection where the update is initiated
			Is called first
			Is called only once in bulk ops
		Tasks: 
			Populate context with images, documents, pages
		Issues:
			This data is actually only required if post.hasOwnPage
		Limits:
			Applies only if user has only one site
	*/
	try {
		if (['create', 'update', 'delete'].includes(operation)) {

			args.req.context.user ??= args.req?.user?.shortName ?? 'internal'
			args.req.context.mode ??= getAppMode()
			args.req.context.host ??= process.env.HOST
			args.req.context.locale ??= args.req.locale

			const user = args.req.context.user

			if (args.req.user) {

				if (collections.includes('sites')) {
					// this is the 'sites' collection
					if (args.req.collection.config.slug === 'sites') {
						args.req.context.site = data	
					}
					else {
						// this is another collection
						args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName) // context.sites
						args.req.context.site ??= (args.req.context.sites.length === 1) ? args.req.context.sites[0] : undefined // context.site
						// if this page is updated internally by another localized version of the same page
						// 'args.req.context.sites' is already set by the update operation	
					}
				}

				if (args.req.user.sites.length === 1) {
					// applies only if user has only one site

					const siteID = args.req.user.sites[0].id ?? args.req.user.sites[0]
					// images
					if (collections.includes('images') && !args.req.context.images) {

						const result = await payload.find({ // Result will be a paginated set of Posts.
							collection: 'images',
							depth: 0,
							where: { 
								or: [
									{ sites: { contains: siteID } },
									{ allSites: { equals: true } },
								]
							},
							pagination: false,
						})
					
						if (result.docs.length === 0) log(`no docs found in "images"`, user, __filename, 5)
						else log(`got ${result.docs.length} from "images"`, user, __filename, 7)
						
						args.req.context.images = result
					}
					// documents
					if (collections.includes('documents') && !args.req.context.documents) {

						const result = await payload.find({ // Result will be a paginated set of Posts.
							collection: 'documents',
							depth: 0,
							where: { sites: { contains: siteID } },
							pagination: false,
						})

						if (result.docs.length === 0) log(`no docs found in "documents"`, user, __filename, 5)
						else log(`got ${result.docs.length} from "documents"`, user, __filename, 7)
						
						args.req.context.documents = result
					}
					// pages
					if (collections.includes('pages') && !args.req.context.pages) {
						
						const result = await payload.find({ // Result will be a paginated set of Posts.
							collection: 'pages',
							depth: 0,
							where: { site: { contains: siteID } },
							pagination: false,
						})

						if (result.docs.length === 0) log(`no docs found in "pages"`, user, __filename, 5)
						else log(`got ${result.docs.length} from "pages"`, user, __filename, 7)
						
						args.req.context.pages = result
					}
				}
			}
		}
	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}