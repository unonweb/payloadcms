const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderLayoutFlex(block, meta, context) {

	let HTML = ''
	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-justify': block.justify,
		'data-align': block.align,
		// style
		'style': {
			'--justify-content': block.justifyContent,
			'--align-items': block.alignItems,
			'--gap': `${block.gap}%`, // number
		}
	}

	if (attributes.style) {
		attributes.style = Object.entries(attributes.style).filter(entry => entry[1]).map(entry => `${entry[0]}: ${entry[1]}; `).reduce((prev, curr) => `${prev} ${curr}`, '')		
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	/* html columns */
	HTML = block.columns.map(col => {

		const attributes = {
			'class': 'flex-item',
			'style': {
				'--min-width': (col.minwidth) ? `${col.minwidth}px` : null,
				'--width': (col.width) ? `${col.width}%` : null,
			}
		}

		if (attributes.style) {
			attributes.style = Object.entries(attributes.style).filter(entry => entry[1]).map(entry => `${entry[0]}: ${entry[1]}; `).reduce((prev, curr) => `${prev} ${curr}`, '')		
		}
	
		const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

		return /* html */`
			<div ${attStr}>
				${renderLexicalHTML(col.richText.root.children, meta, context)}
			</div>
		`
	}).join(' ')

	/* html result */
	HTML = /* html */`
		<div class="flex" ${attStr}>
			${HTML}
		</div>`;

	return HTML // returns a string
}