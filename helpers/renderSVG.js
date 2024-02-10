export default function renderSVG(block = {}) {
		
	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '', 
	].filter(item => item)

	for (const attribute of block.attributes ?? []) {
		attributes.push(`${attribute.key}="${attribute.value}"`)
	}

	let html = /* html */`
		<div ${attributes.join(' ')}>${block.svg}</div>
	`

	return html
}