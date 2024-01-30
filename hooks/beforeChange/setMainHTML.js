import hasChanged from '../_hasChanged'
import iterateBlocks from '../iterateBlocks'
import log from '../../customLog'
import mailError from '../../mailError'

export default async function setMainHTML({ data, req, operation, originalDoc, context }) {
	/*
		Hook:
			beforeChange
		Tasks:
			Iterate blocks and update:
			- data.html.main or data.html
			- data.assets.imgs
			- data.assets.docs
			- data.assets.head
	*/
	try {
		const site = context.site
		const user = context.user
		const host = context.host

		const blocks = (data.main?.blocks) ? data.main.blocks : data.blocks
		const prevBlocks = (originalDoc.main?.blocks) ? originalDoc.main.blocks : originalDoc.blocks

		if (blocks && blocks.length > 0) {
			if (host === 'lem' || operation === 'create' || (operation === 'update' && hasChanged(blocks, prevBlocks, user))) {
					// data contains the current values
					// originalDoc contains the previous values
					// seems to work with bulk operations, too

				/* iterate blocks */
				const { html, imgFiles, docFiles, libPathsWeb } = iterateBlocks(data, blocks, context)

				if (typeof data.html === 'object') {
					data.html.main = html // update post.html.main	
				} 
				if (typeof data.html === 'string') {
					data.html = html // update post.html		
				}
				
				data.assets.imgs = imgFiles // update post.assets.imgs
				data.assets.docs = docFiles // update post.assets.docs
				data.assets.head = libPathsWeb // update page.assets.head
			}
		}

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error, req)
	}
}