import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import getCol from '../getCol'
import iterateBlocks from '../../helpers/iterateBlocks'
import renderLexicalHTML from '../../helpers/renderLexicalHTML'

export default async function setMainHTMLPage({ data, req, operation, originalDoc, context }) {
	/*
		Hook:
			beforeChange collection
		Called by:
			- Pages
			- Headers
			- Navs
			- Footers
		Tasks:
			Iterate blocks and update properties
		Return:
			- data.html.main or data.html
			- data.assets.imgs
			- data.assets.docs
			- data.assets.head
	*/
	try {
		if (context.skipSetMainHTML) return

		const user = context.user
		const host = context.host

		// meta
		let meta = {}
		meta.slug = (data.slug === '') ? '/' : data.slug
		meta.title = data.title
		meta.id = originalDoc.id ?? undefined
		meta.origin = context.site.paths.web.origin[context.mode]
		meta.origin = (meta.origin.endsWith('/')) ? meta.origin.slice(0, -1) : meta.origin // cut off trailing '/'
		meta.theme = context.site?.domainShort ?? ''
		meta.locale ??= req.locale
		// context
		context.imgFiles = new Set()
		context.docFiles = new Set()
		context.libPathsWeb = new Set()
		context.posts ??= await getCol('posts-flex', user, { depth: 0, locale: req.locale, overrideAccess: true, user: req.user }) // <-- IMP!

		// update post.html.main
		data.html.main = renderLexicalHTML(data.main.richText.root.children, meta, context)
		

		data.assets.imgs = Array.from(context.imgFiles) // update post.assets.imgs
		data.assets.docs = Array.from(context.docFiles) // update post.assets.docs
		data.assets.head = Array.from(context.libPathsWeb) // update page.assets.head

		return data

	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error)
	}
}