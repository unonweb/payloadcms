export default async function afterOperationHook(col = '', { args, operation }) {
	if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
		console.timeEnd(`<7>[time] [${col}] [total] "${args.req.context.timeID}"`)
	}
}