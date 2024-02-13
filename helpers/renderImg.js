const renderImageset = require('./renderImageset')

module.exports = function renderImg(block, meta, context) {
	/*
		Arguments:
			- block.rel
			- block.link.type
			- block.link.url
			- block.link.rel.value
			- block.caption
	*/
	
	const pages = context.pages.docs
	const locale = meta.locale
	const origin = meta.origin

	let attributes = {
		// meta
		//'data-theme': meta.theme,
		//'data-page': meta.slug,
		// block
		'data-shape': block.shape,
		'data-width': block.width, // 25, 33, 50, 66, 75, 100
		'data-height': block.height, // '120px', '240px', '360px', '480px', '600px', auto
		'data-filter': block.filter,
		'data-hover': block.hover?.join(' '),
		'data-mask': block.mask,
	}

	if (block.shape === 'circle') {
		attributes['data-height'] = 'auto'
	}

	let href

	if (block.link?.type === 'internal') {
		const linkedDoc = pages.find(p => p.id === block.link.rel.value)
		const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
		href = `${origin}/${slug}`		
	}
	
	if (block.link?.type === 'custom') {
		href = `${block.link.url}`
	}

	const innerHTML = (href)
		? /* html */`<a href="${href}">${renderImageset(block.rel, meta, context, attributes)}</a>`
		: renderImageset(block.rel, meta, context, attributes)

	if (block.caption) {
		html = /* html */`
		<figure>
			${innerHTML}
			<figcaption>${block.caption}</figcaption>
		</figure>
		`;
	} else {
		html = /* html */`${innerHTML}`
	}

	return html
}