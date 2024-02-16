const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderLayoutGridFlex(block, meta, context) {

	const templateColumns = block.columns.reduce((acc, curr) => acc + `${curr.width}${curr.unit} `, '').trimEnd()

	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-layout': block.layout,
		'data-gap': block.gap,
		'data-justify': block.justify,
		'data-align': block.align,
		// style
		'style': {
			'--templateColumns': templateColumns
		}
	}

	if (attributes.style) {
		attributes.style = Object.entries(attributes.style).filter(entry => entry[1]).map(entry => `${entry[0]}: ${entry[1]}; `).reduce((prev, curr) => `${prev} ${curr}`, '')		
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	let html = /* html */`
		<div class="grid" ${attStr}>
			${block.columns.map((col, index) => {
				return /* html */`
					<div class="grid-col-${index}">
						${renderLexicalHTML(col.richText.root.children, meta, context)}
					</div>
				`
			}).join(' ')}
		</div>`;

	return html // returns a string
}