import log from '../../helpers/customLog'
import getRelatedDoc from '../getRelatedDoc'
import getCol from '../getCol'

/* 
beforeValidate:
	1. validate runs on the client
	2. if successful, beforeValidate runs on the server
	3. validate runs on the server 
*/

export default async function populateContextBeforeChange({ data, req, operation, originalDoc, context }, collections = []) {
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
		if (collections.includes('sites')) {

			req.context.site ??= (req.collection.config.slug === 'sites') ? doc : null
			req.context.site ??= (typeof doc.site === 'string' && req.context.sites) ? req.context.sites.find(item => item.id === doc.site) : null
			req.context.site ??= await getRelatedDoc('sites', doc.site, req.context.user)
			req.context.pathSite ??= `${req.context.site.paths.fs.site}/${req.context.mode}`
			req.context.locale ??= req.locale
		}

		const siteID = (req.collection.config.slug === 'sites') ? doc.id : doc.site
		if (!siteID) throw new Error('siteID not set!')
		
		

	} catch (error) {
		log(error.stack, req.context.user, __filename, 3)
	}
}