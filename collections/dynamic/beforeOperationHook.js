import getUserSites from '../../hooks/getUserSites'
import getCol from '../../hooks/_getCol'

export default async function beforeOperationHook(col = '', { args, operation }) {
	if (['create', 'update', 'delete'].includes(operation)) {
		if (args.req.user) {
			args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
		}
		args.req.context.timeID ??= Date.now()
		console.time(`<7>[time] [${col}] "${args.req.context.timeID}"`)

		if (args.req.user && args.req.user.sites.length === 1) {
			// applies only if user has only one site <-- interim solution
			const siteID = args.req.user.sites[0].id ?? args.req.user.sites[0]

			args.req.context.images = await getCol('images', args.req.user.shortName, {
				depth: 0,
				where: { sites: { contain: siteID } }
			})
			args.req.context.documents = await getCol('documents', args.req.user.shortName, {
				depth: 0,
				where: { sites: { contain: siteID } }
			})
			args.req.context.pages = await getCol('pages', args.req.user.shortName, {
				depth: 0,
				where: { site: { equals: siteID } },
			})
		}
	}
}