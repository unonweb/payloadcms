import hasChanged from '../../helpers/_hasChanged'
import iterateBlocks from '../../helpers/iterateBlocks'
import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'

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
		const user = context.user
		const host = context.host

		const blocks = (data.main?.blocks) ? data.main.blocks : data.blocks
		const prevBlocks = (operation === 'update') ? originalDoc.main?.blocks ?? originalDoc.blocks : null

		if (blocks && blocks.length === 0) return
		if (context.skipSetMainHTML) return

		/* iterate blocks */
		const { html, imgFiles, docFiles, libPathsWeb } = iterateBlocks(data, blocks, req.locale, context)

		data.html.main = html // update post.html.main	
		data.assets.imgs = imgFiles // update post.assets.imgs
		data.assets.docs = docFiles // update post.assets.docs
		data.assets.head = libPathsWeb // update page.assets.head

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error)
	}
}