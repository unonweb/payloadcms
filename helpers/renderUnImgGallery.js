import renderImageset from './renderImageset';
import log from './customLog';

export default function renderUnImgGallery(block, meta, context) {
	
	const origin = meta.origin
	const user = context.user
	
	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.onclick) ? `data-onclick=${block.onclick}` : '',
		(block.modal) ? `data-modal=${block.modal}` : '',
		(block.number) ? `data-number=${block.number}` : '',
		(block.justify) ? `data-justify=${block.justify}` : '',
		(block.shape) ? `data-shape=${block.shape}` : '',
		(block.filter) ? `data-filter=${block.filter}` : '',
		(block.hover?.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-img-gallery ${attributes}>
			${block.images.map((img) => {
				switch (img.link.type) {
					case 'internal':
						return /* html */`<a href="${origin}/${img.link.slug}" slot="gallery">${renderImageset(img.rel, meta, context, { sizes: '50vw', loading: 'eager' })}</a>`;
					case 'custom':
						return /* html */`<a href="${img.link.url}" slot="gallery">${renderImageset(img.rel, meta, context, { sizes: '50vw', loading: 'eager' })}</a>`;
					case 'none':
						return renderImageset(img.rel, meta, context, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
					case 'undefined':
						log('linkType == undefined', user, __filename, 4);
				}
			}).join('')}
		</un-img-gallery>`;

	return html
}