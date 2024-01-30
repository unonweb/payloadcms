import hasChanged from '../../hooks/_hasChanged'
import getCol from '../../hooks/_getCol'
import iterateBlocks from '../../hooks/iterateBlocks'
import getAppMode from '../../hooks/_getAppMode'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import log from '../../customLog'

export default async function beforeChangeHook(col = '', { data, req, operation, originalDoc, context }) {
	/*
		Iterate blocks and update:
		- data.html
		- data.assets.imgs
		Requires:
		- col.html
		- col.assets.imgs
	*/
	try {
		/* update context */
		context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : null // try to find site in context.sites
		context.site ??= await getRelatedDoc('sites', data.site, user)
		context.user = req?.user?.shortName ?? 'internal'
		context.mode = getAppMode()
		context.host = process.env.HOST
		context.pathSite = `${context.site.paths.fs.site}/${context.mode}`
		const user = context.user
		const site = context.site
		const host = context.host
		const mode = context.mode
		log('--- beforeChange ---', user, __filename, 7)

		/* iterate blocks */
		if (data.blocks && data.blocks.length > 0) {
			if (host === 'lem' || operation === 'create' || (operation === 'update' && hasChanged(data.blocks, originalDoc?.blocks, user))) {

				const images = await getCol('images', user, {
					depth: 0,
					where: {
						sites: { contains: site.id }
					}
				})

				const pages = await getCol('pages', user, {
					depth: 0,
					where: {
						site: { equals: site.id }
					},
					locale: 'all'
				})

				const { html, imgFiles } = iterateBlocks(data, {
					user: user,
					locale: req.locale,
					blocks: data.blocks,
					site: site,
					images: images.docs,
					pages: pages.docs
				})

				/* update data */
				data.html = html
				data.assets.imgs = imgFiles
			}
		}

		return data

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}