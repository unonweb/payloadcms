const renderImageset = require('./renderImageset')
const log = require('./customLog');

module.exports = function renderUnImgGallery(block, meta, context) {
	
	const origin = meta.origin
	const user = context.user
	let HTML = ''

	/* attributes */
	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-onclick': block.onclick,
		'data-modal': block.modal,
		'data-number': block.number,
		'data-justify': block.justify,
		'data-shape': block.shape,
		'data-filter': block.filter,
		'data-hover': block.hover?.join(' '), // array
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')
	
	/* HTML */

	HTML = /* html */`
		<un-img-gallery ${attStr}>
			${block.images.map((img) => {
				return renderImageset(img.rel, meta, context, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
			}).join('')}
		</un-img-gallery>`;

	return HTML
}

/* switch (img.link.type) {
	case 'internal':
		return `<a href="${origin}/${img.link.slug}" slot="gallery">${renderImageset(img.rel, meta, context, { sizes: '50vw', loading: 'eager' })}</a>`;
	case 'custom':
		return `<a href="${img.link.url}" slot="gallery">${renderImageset(img.rel, meta, context, { sizes: '50vw', loading: 'eager' })}</a>`;
	case 'none':
		return renderImageset(img.rel, meta, context, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
	case 'undefined':
		log('linkType == undefined', user, __filename, 4);
} */