export default function renderUnImgGallery(block = {}) {
	// blockType = 'img-gallery'
	
	const attributes = [
		// global
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
		// functional
		(block.onclick) ? `data-onclick=${block.onclick}` : '',
		(block.modal) ? `data-modal=${block.modal}` : '',
		// layout
		(block.number) ? `data-number=${block.number}` : '',
		(block.justify) ? `data-justify=${block.justify}` : '',
		// style
		(block.shape) ? `data-shape=${block.shape}` : '',
		(block.filter) ? `data-filter=${block.filter}` : '',
		(block.hover?.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-img-gallery ${attributes}>
			${block.images.map((img) => {
				switch (img.link.type) {
					case 'internal':
						return /* html */`<a href="${origin}/${img.link.slug}" slot="gallery">${renderImageset(img.rel, context, { sizes: '50vw', loading: 'eager' })}</a>`;
					case 'custom':
						return /* html */`<a href="${img.link.url}" slot="gallery">${renderImageset(img.rel, context, { sizes: '50vw', loading: 'eager' })}</a>`;
					case 'none':
						return renderImageset(img.rel, context, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
					case 'undefined':
						log('linkType == undefined', user, __filename, 4);
				}
			}).join('')}
		</un-img-gallery>`;

	return html
}