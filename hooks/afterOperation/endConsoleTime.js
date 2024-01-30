export default async function endConsoleTime(colSlug = '', { args, operation }) {
	
	if (!['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
		return
	}

	console.timeEnd(`<7>[time] [${colSlug}] "${args.req.context.timeID}"`)
}