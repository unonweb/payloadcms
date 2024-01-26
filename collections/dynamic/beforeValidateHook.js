import log from '../../customLog'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import getAppMode from '../../hooks/_getAppMode'

export default async function beforeValidateHook(col = '', { data, req, operation, originalDoc }) {
	/* 
		Order:
			- after beforeValidate field lvl
		Task:
			- Populate context with useful properties
		Attention:
			- context is req.context
	*/
	try {
		req.context.user ??= req?.user?.shortName ?? 'internal'
		req.context.site ??= (typeof data.site === 'string' && req.context.sites) ? req.context.sites.find(item => item.id === data.site) : null
		req.context.site ??= await getRelatedDoc('sites', data.site, req.context.user)
		req.context.mode = getAppMode()
		req.context.host = process.env.HOST
		req.context.pathSite = `${req.context.site.paths.fs.site}/${req.context.mode}`
	} catch (error) {
		log(error.stack, req.context.user, __filename, 3)
	}
}