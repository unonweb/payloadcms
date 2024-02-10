export default function renderSVG(block, meta, context) {
		
	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '', 
	].filter(item => item)

	for (const attribute of block.attributes ?? []) {
		attributes.push(`${attribute.key}="${attribute.value}"`)
	}

	let html = /* html */`
		<div ${attributes.join(' ')}>${block.svg}</div>
	`

	return html
}