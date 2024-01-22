import hasChanged from '../../hooks/_hasChanged'
import getCol from '../../hooks/_getCol'
import iterateBlocks from '../../hooks/iterateBlocks'
import getAppMode from '../../hooks/_getAppMode'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import log from '../../customLog'

export default async function beforeChangeHook(col = '', { data, req, operation, originalDoc, context }) {

	try {
		const user = req?.user?.shortName ?? 'internal'
		context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : null
		context.site ??= await getRelatedDoc('sites', data.site, user)
		const site = context.site
		const host = process.env.HOST
		const mode = getAppMode()
		log('--- beforeChange ---', user, __filename, 7)

		if (data.blocks && data.blocks.length > 0) {
			if (host === 'lem' || operation === 'create' || (operation === 'update' && hasChanged(data.blocks, originalDoc?.blocks, user))) {

				/* iterate blocks */
				const images = await getCol('images', user, {
					depth: 0,
					where: {
						sites: { contain: site.id }
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