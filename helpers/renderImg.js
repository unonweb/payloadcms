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
	// context
	const pages = context.pages.docs
	const images = context.images.docs
	// meta
	const locale = meta.locale
	const origin = meta.origin
	// static
	const pathWebImgs = '/assets/imgs'
	let href = ''
	let HTML = ''
	let wrap = false

	const img = (typeof block.rel === 'string') ? images.find(item => item.id === block.rel) : block.rel

	let attributes = {
		// meta
		//'data-theme': meta.theme,
		//'data-page': meta.id,
		// block
		'data-shape': block.shape,
		'data-width': block.width, // 25, 33, 50, 66, 75, 100
		'data-height': block.height, // '120px', '240px', '360px', '480px', '600px', auto
		'data-filter': block.filter,
		'data-hover': block.hover?.join(' '), // ['scale', 'lighten', 'outline', 'shadow', 'magnify']
		'data-mask': block.mask,
		'data-align': (block.alignX && block.alignY) ? `${block.alignX} ${block.alignY}` : (block.alignY) ? block.alignY : (block.alignX) ? block.alignX : null
	}

	if (block.shape === 'circle') {
		attributes['data-height'] = 'auto'
	}

	if (block.link?.type === 'internal') {
		const linkedDoc = pages.find(p => p.id === block.link.rel.value)
		const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
		href = `${origin}/${slug}`
	}

	if (block.link?.type === 'custom') {
		href = `${block.link.url}`
	}

	HTML = (href)
		? /* html */`<a href="${href}">${renderImageset(img, meta, context, attributes)}</a>`
		: renderImageset(img, meta, context, attributes)

	// magnify
	if (block.hover.includes('magnify')) {
		wrap = true
		HTML = /* html */`
			${HTML}
			<div id="large-img" style="background: url('${pathWebImgs}/${img.filename}') no-repeat #fff;"></div>
		`
	}

	if (wrap) {
		HTML = /* html */`<div class="wrap">${HTML}</div>`
	}
	/* if (block.hover.includes('magnify')) {
		innerHTML = `
			<div id="zoom" class="magnify-wrapper">
				${innerHTML}
			<div id="large-img" style="background: url('${pathWebImgs}/${img.filename}') no-repeat #fff;"></div>
			</div>
		`
	} */

	if (block.caption) {
		HTML = /* html */`
		<figure>
			${HTML}
			<figcaption>${block.caption}</figcaption>
		</figure>
		`;
	} else {
		HTML = /* html */`${HTML}`
	}

	return HTML
}