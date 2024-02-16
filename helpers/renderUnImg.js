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
	// context
	const pages = context.pages.docs
	const locale = meta.locale
	const origin = meta.origin
	// static
	const pathWebImgs = '/assets/imgs'
	let href = ''
	let HTML = ''

	/* attributes */

	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-shape': block.shape, // select
		//'data-width': block.width, // select: 25, 33, 50, 66, 75, 100
		'data-height': block.height, // select: '120px', '240px', '360px', '480px', '600px', auto
		'data-filter': block.filter, // select
		'data-hover': block.hover?.join(' '), // select
		'data-mask': block.mask, // select
		//'data-align': (block.alignX && block.alignY) ? `${block.alignX} ${block.alignY}` : (block.alignY) ? block.alignY : (block.alignX) ? block.alignX : null,
		'style': {
			'--align-self': block.alignSelf, // text
			'--width': (block.width) ? `${block.width}%` : null, // number
			'--min-width': (block.minwidth) ? `${block.minwidth}px` : null, // number
			'--max-width': (block.maxwidth) ? `${block.maxwidth}px` : null, // number
		}
	}

	if (block.shape === 'circle') {
		attributes['data-height'] = 'auto'
	}

	if (attributes.style) {
		attributes.style = Object.entries(attributes.style).filter(entry => entry[1]).map(entry => `${entry[0]}: ${entry[1]}; `).reduce((prev, curr) => `${prev} ${curr}`, '')		
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}="${entry[1]}"`).reduce((prev, curr) => `${prev} ${curr}`, '')

	/* href */

	if (block.link?.type === 'internal') {
		const linkedDoc = pages.find(p => p.id === block.link.rel.value)
		const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
		href = `${origin}/${slug}`		
	}
	
	if (block.link?.type === 'custom') {
		href = `${block.link.url}`
	}

	/* HTML */

	HTML = (href)
		? /* html */`<a href="${href}"><un-img ${attStr}>${renderImageset(block.rel, meta, context)}</un-img></a>`
		: /* html */`<un-img ${attStr}>${renderImageset(block.rel, meta, context)}</un-img>`

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
		(meta.id) ? `data-page="${meta.id}"` : '',
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