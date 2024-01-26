import getAppMode from '../../hooks/_getAppMode'
import getCol from '../../hooks/_getCol'
import hasChanged from '../../hooks/_hasChanged'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import iterateBlocks from '../../hooks/iterateBlocks'
import renderHTMLHead from '../../hooks/renderHTMLHead'
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
		const site = context.site
		const user = context.user
		const host = context.host
		log('--- beforeChange ---', user, __filename, 7)

		if (data.blocks && data.blocks.length > 0) {
			if (host === 'lem' || operation === 'create' || (operation === 'update' && hasChanged(data.blocks, originalDoc?.blocks, user))) {
					// data contains the current values
					// originalDoc contains the previous values
					// seems to work with bulk operations, too

				/* iterate blocks */
				const images = await getCol('images', user, {
					depth: 0,
					where: {
						sites: { contain: site.id }
					}
				})

				const documents = await getCol('documents', user, {
					depth: 0,
					where: {
						sites: { contain: site.id }
					}
				})

				const pages = await getCol('pages', user, {
					depth: 0,
					where: {
						site: { equals: site.id }
					}
				})

				const { html, imgFiles, docFiles, libPathsWeb } = iterateBlocks(data, {
					user: user,
					locale: req.locale,
					blocks: data.blocks,
					site: site,
					images: images.docs,
					documents: documents.docs,
					pages: pages.docs,
				})

				data.html.main = html // update post.html.main
				data.assets.imgs = imgFiles // update post.assets.imgs
				data.assets.docs = docFiles // update post.assets.docs
				data.assets.head = libPathsWeb // update page.assets.head
			}
		}

		if (data.hasOwnPage) {
			data.html.head = await renderHTMLHead(data, site, user) // update post.html.head (do it always, because in prod it's cheap)
		}

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}