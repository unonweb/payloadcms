import hasChanged from '../../hooks/_hasChanged'
import getCol from '../../hooks/_getCol'
import iterateBlocks from '../../hooks/iterateBlocks'
import getAppMode from '../../hooks/_getAppMode'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import log from '../../customLog'
import renderHTMLElement from '../../hooks/_renderHTMLElement'

export default async function beforeChangeHook(col = '', { data, req, operation, originalDoc, context }) {
	/*
		Iterate blocks and update:
		- data.html.main
		- data.html.head
		- data.assets.imgs
		- data.assets.docs
		- data.assets.head
	*/
	try {
		/* update context */
		const user = req?.user?.shortName ?? 'internal'
		log('--- beforeChange ---', user, __filename, 7)

		context.site ??= (typeof data.site === 'string' && context.sites) ? context.sites.find(item => item.id === data.site) : null
		context.site ??= await getRelatedDoc('sites', data.site, user)
		const site = context.site

		if (data.blocks && data.blocks.length > 0) {
			if (!data.html.main || hasChanged(data.blocks, originalDoc?.blocks, user)) {
				// data contains the current values
				// originalDoc contains the previous values
				// seems to work with bulk operations, too
			}

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
				locale: req.locale, // <-- ATT! Really?
				blocks: data.blocks,
				site: site,
				images: images.docs, // collection data
				documents: documents.docs, // collection data
				pages: pages.docs, // collection data
			})

			/* for (const path of libPathsWeb) {
				// '/assets/lib/leaflet-1.9.4.css'
				// '/assets/custom-elements/un-map-leaflet.js'
				if (path.startsWith('/assets/lib/')) {
					// only care about lib files because separate c-elements files are copied via a standalone script
					const dest = `${pathSite}${path}`
					const src = `${site.paths.fs.admin.resources}${path}`
					await cpFile(src, dest, user, { overwrite: false, ctParentPath: true })
				}
			} */

			data.html.main = html // update post.html.main
			data.assets.imgs = imgFiles // update post.assets.imgs
			data.assets.docs = docFiles // update post.assets.docs
			data.assets.head = libPathsWeb // update page.assets.head
		}

		if (data.hasOwnPage) {
			data.html.head = await renderHTMLHead(data, site, user) // update post.html.head (do it always, because in prod it's cheap)
		}

		return data

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}