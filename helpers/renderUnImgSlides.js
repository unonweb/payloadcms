export default function renderUnImgSlides(block = {}) {
		
	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].join(' ')

	let html = /* html */`	
		<un-img-slides ${attributes} arrows="true" bullets="true" thumbnails="0" autoslide="false">
			${(block.images.map((img) => renderImageset(img, context, { loading: "lazy" }))).join(' ')}
		</un-img-slides>
	`;

	return html
}