import getUserSites from '../../hooks/getUserSites'

export default async function beforeOperationHook(col = '', { args, operation }) {
	if (['create', 'update', 'delete'].includes(operation)) {
		if (args.req.user) {
			args.req.context.sites ??= await getUserSites(args.req.user.sites, args.req.user.shortName)
		}
		args.req.context.timeID ??= Date.now()
		console.time(`<7>[time] [${col}] "${args.req.context.timeID}"`)
	}
}