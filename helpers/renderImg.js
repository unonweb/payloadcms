export default function renderImg(block = {}) {

	if (block.caption) {
		html = /* html */`
		<figure>
			${renderImageset(block.rel, context)}
			<figcaption>${block.caption}</figcaption>
		</figure>
		`;
	} else {
		html = /* html */`${renderImageset(block.rel, context)}`
	}

	return html
}