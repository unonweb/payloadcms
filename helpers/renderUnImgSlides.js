const renderImageset = require('./renderImageset')

module.exports = function renderUnImgSlides(block, meta, context) {
		
	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
	].join(' ')

	let html = /* html */`	
		<un-img-slides ${attributes} arrows="true" bullets="true" thumbnails="0" autoslide="false">
			${(block.images.map((img) => renderImageset(img, meta, context, { loading: "lazy" }))).join(' ')}
		</un-img-slides>
	`;

	return html
}