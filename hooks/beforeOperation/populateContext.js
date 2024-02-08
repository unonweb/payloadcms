import payload from 'payload'
import getUserSites from '../getUserSites'
import getAppMode from '../../helpers/_getAppMode'
import log from '../../helpers/customLog'

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

		if (!args.req.user) return

		if (['create', 'update', 'delete'].includes(operation)) {
			args.req.context.user ??= args.req?.user?.shortName ?? 'internal'
			args.req.context.mode ??= getAppMode()
			args.req.context.host ??= process.env.HOST
			args.req.context.locale ??= args.req.locale

			if (collections.includes('sites')) {
				if (args.req.collection.config.slug === 'sites') {
					// this is 'sites'
					args.req.context.site ??= args.data
					args.req.context.site.id ??= args.id
				}
				else {
					// this is another collection
					args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName) // context.sites
					args.req.context.site ??= (args.req.context.sites.length === 1) ? args.req.context.sites[0] : undefined // user has only one site
					args.req.context.pathSite ??= `${args.req.context.site.paths.fs.site}/${args.req.context.mode}`
				}
			}
		}

		if (['create', 'update'].includes(operation)) {
			/* 	
				Task:
					Get collection data 
				Requires:
					site.id
				Attention:
					- args.data.site is an array in some collections
					- args.req.user is not set in updates via local API
			*/
			const user = args.req.context.user
			const siteID = (args.req?.collection?.config?.slug === 'sites') ? args.id : args.req.context.site.id // args.data.site doesn't work here because in some collections it's an array!
			//if (args.req.user.sites[0] !== siteID) throw new Error("user site doesn't match the site currently edited")
			
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
					overrideAccess: false,
					user: args.req.user,
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
					overrideAccess: false,
					user: args.req.user,
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
					overrideAccess: false,
					user: args.req.user,
					locale: 'all',
				})

				if (result.docs.length === 0) log(`no docs found in "pages"`, user, __filename, 5)
				else log(`got ${result.docs.length} from "pages"`, user, __filename, 7)

				args.req.context.pages = result
			}
		}
	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}