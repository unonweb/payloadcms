import log from './customLog'
import iterateBlocks from './iterateBlocks';

export default function handleBlocks(doc, blocks = [], locale = '', context) {
	// called for each page that is to be rendered

	// meta
	let meta = {}
	meta.slug = (doc.slug === '') ? '/' : doc.slug
	meta.title = doc.title
	meta.origin = context.site.paths.web.origin[context.mode]
	meta.origin = (meta.origin.endsWith('/')) ? meta.origin.slice(0, -1) : meta.origin // cut off trailing '/'
	meta.theme = context.site?.domainShort ?? ''
	meta.locale ??= locale
	// context
	context.imgFiles = new Set()
	context.docFiles = new Set()
	context.libPathsWeb = new Set()
	
	const user = context.user

	/* checks */
	if (!context.documents || context.documents?.length === 0) {
		log('empty array: "documents"', user, __filename, 5)
	}
	if (!context.images || context.images?.length === 0) {
		log('empty array: "images"', user, __filename, 5)
	}
	if (!context.pages || context.pages?.length === 0) {
		log('empty array: "pages"', user, __filename, 5)
	}

	let html
	
	html = iterateBlocks(blocks, meta, context); // action!
	
	html = html.replace(/\s+/g, " ").trim()
	// html = html.replace(/[\n\r\s]+/g, " ").trim()
	
	return html
}