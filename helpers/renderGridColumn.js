const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderGridColumn(block, meta, context) {

	let attributes = {
		// meta
		//'data-theme': meta.theme,
		//'data-page': meta.id,
		// block
		'data-fr': block.fraction,
		//'data-gap': block.gap,
		//'data-justify': block.justify,
		//'data-align': block.align,
		//'class': `block.fraction`
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	let html = /* html */`
		<div ${attStr}>
			${renderLexicalHTML(block.richText.root.children, meta, context)}</div>
		</div>`;

	return html // returns a string
}