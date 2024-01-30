import log from '../../customLog'
import getRelatedDoc from '../getRelatedDoc'
import getCol from '../_getCol'

/* 
beforeValidate:
	1. validate runs on the client
	2. if successful, beforeValidate runs on the server
	3. validate runs on the server 
*/

export default async function populateContextBeforeVal({ data, req }) {
	/*	
		Type:
			beforeValidate collection hook
		Operations:
			Before 'create' and 'update'
		Order:
			- after beforeValidate field lvl
		Task:
			- Populate context with useful properties
		Attention:
			- context is req.context
			- does not run in delete ops
	*/
	try {
		// site
		req.context.site ??= (req.collection?.config?.slug === 'sites') ? data : null // if this is the 'sites' collection
		req.context.site ??= (typeof data.site === 'string' && req.context.sites) ? req.context.sites.find(item => item.id === data.site) : null
		req.context.site ??= await getRelatedDoc('sites', data.site, req.context.user)
		req.context.pathSite ??= `${req.context.site.paths.fs.site}/${req.context.mode}`
		req.context.locale ??= req.locale

		// collection
		// necessary because sometimes this is not populated in beforeOperationHook
		req.context.images ??= await getCol('images', req.context.user, {
			depth: 0,
			where: { 
				or: [
					{ sites: { contains: req.context.site.id } },
					{ allSites: { equals: true } },
				]
			},
			pagination: false,
		})
		req.context.documents ??= await getCol('documents', req.context.user, {
			depth: 0,
			where: { sites: { contains: req.context.site.id } },
			pagination: false,
		})
		req.context.pages ??= await getCol('pages', req.context.user, {
			depth: 0,
			where: { site: { equals: req.context.site.id } },
			pagination: false,
		})

	} catch (error) {
		log(error.stack, req.context.user, __filename, 3)
	}
}