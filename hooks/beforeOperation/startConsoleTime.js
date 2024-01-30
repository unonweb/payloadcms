export default async function startConsoleTime(colSlug = '', { args, operation }) {
	if (['create', 'update', 'delete'].includes(operation)) {
		/* time */
		args.req.context.timeID = Date.now()
		console.time(`<7>[time] [${colSlug}] "${args.req.context.timeID}"`)
	}
}