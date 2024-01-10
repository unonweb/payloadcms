import hasChanged from './_hasChanged'
import getCol from './_getCol'
import iterateBlocks from './iterateBlocks'
import getAppMode from './_getAppMode'
import getRelatedDoc from './getRelatedDoc'
import log from '../customLog'

export default async function pageElementBeforeChange(col = '', { data, req, operation, originalDoc, context }) {

	try {
		const user = req?.user?.shortName ?? 'internal'
		context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : await getRelatedDoc('sites', data.site, user)
		const site = context.site
		const mode = getAppMode()
		log('--- beforeChange ---', user, __filename, 7)

		if (data.blocks && data.blocks.length > 0) {
			if (mode === 'dev' || operation === 'create' || (operation === 'update' && hasChanged(data.blocks, originalDoc?.blocks, user))) {

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
				data.imgs = imgFiles
			}
		}

		return data

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}