const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderLayoutGridFixed(block, meta, context) {

	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-layout': block.layout,
		'data-gap': block.gap,
		'data-justify': block.justify,
		'data-align': block.align,
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	const colOne = (block.one.richText.root.children.length > 0)
		? /* html */`<div class="col one">${renderLexicalHTML(block.one.richText.root.children, meta, context)}</div>`
		: ''
	
	const colTwo = (block.two.richText.root.children.length > 0)
		? /* html */`<div class="col two">${renderLexicalHTML(block.two.richText.root.children, meta, context)}</div>`
		: ''

	let html = /* html */`
		<div ${attStr}>
			${colOne}
			${colTwo}
		</div>`;

	return html // returns a string
}