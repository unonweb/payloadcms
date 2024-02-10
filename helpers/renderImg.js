import renderImageset from './renderImageset';

export default function renderImg(block, meta, context) {

	if (block.caption) {
		html = /* html */`
		<figure>
			${renderImageset(block.rel, meta, context)}
			<figcaption>${block.caption}</figcaption>
		</figure>
		`;
	} else {
		html = /* html */`${renderImageset(block.rel, meta, context)}`
	}

	return html
}