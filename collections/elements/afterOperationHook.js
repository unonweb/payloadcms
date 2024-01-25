import log from '../../customLog'
import mailError from '../../mailError'

export default async function afterOperationHook(col = '', { args, operation }) {
	try {
		if (['create', 'update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
			console.timeEnd(`<7>[time] [${col}] [total] "${args.req.context.timeID}"`)
		}	
	} catch (error) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
	}
}