const renderImageset = require('./renderImageset')

module.exports = function renderUnImg(block, meta, context) {
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
		'data-theme': meta.theme,
		'data-page': meta.slug,
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

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`)

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
		? /* html */`<a href="${href}"><un-img ${attStr}>${renderImageset(block.rel, meta, context)}</un-img></a>`
		: /* html */`<un-img ${attStr}>${renderImageset(block.rel, meta, context)}</un-img>`

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

function renderUnImgOld(block, meta, context) {
	/* NOTES:
		- not working with images in RichText content because they're only referenced 
	*/

	if (!block.rel) throw ReferenceError('Error: img.rel is not set')

	const pages = context.pages.docs
	const locale = meta.locale
	const origin = meta.origin

	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.size) ? `data-size=${block.size}` : '',
		(block.shape) ? `data-shape=${block.shape}` : '',
		(block.filter) ? `data-filter=${block.filter}` : '',
		(block.hover?.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
		(block.mask) ? `data-mask=${block.mask}` : '',
	].filter(item => item).join(' ')

	let html = ''
	
	if (['internal', 'custom'].includes(block.link?.type)) {

		let href = ''
		switch (block.link.type) {
			case 'internal':
				const linkedDoc = pages.find(p => p.id === block.link.rel.value)
				const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
				href = `${origin}/${slug}`		
				break;
			case 'custom':
				href = `${block.link.url}`
				break;
		}

		html = /* html */`
			<a href="${href}">
				<un-img ${attributes}>${renderImageset(block.rel, meta, context)}</un-img>
			</a>
		`
		
	} else {
		// no link
		if (block.caption) {
			html = /* html */`
			<figure>
				<un-img ${attributes}>${renderImageset(block.rel, meta, context)}</un-img>
				<figcaption>${block.caption}</figcaption>
			</figure>
			`;
		} else {
			html = /* html */`
			<un-img ${attributes}>${renderImageset(block.rel, meta, context)}</un-img>`;
		}
		
	}
	
	return html // returns a string
}