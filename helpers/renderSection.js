const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderSection(block, meta, context) {

	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-width': block.width,
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	/* for (const attribute of block.attributes ?? []) {
		attributes.push(`${attribute.key}="${attribute.value}"`)
	} */

	let html = /* html */`
		<section ${attStr}>${renderLexicalHTML(block.richText.root.children, meta, context)}</section>
	`

	return html
}