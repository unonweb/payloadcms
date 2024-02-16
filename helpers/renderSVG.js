module.exports = function renderSVG(block, meta, context) {

	let attributes = {
		// meta
		//'data-theme': meta.theme,
		'data-page': meta.id,
	}
	
	for (const attObj of block.attributes) {
		attributes[attObj.key] = attObj.value
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	let html = /* html */`
		<div ${attStr}>${block.svg}</div>
	`

	return html
}