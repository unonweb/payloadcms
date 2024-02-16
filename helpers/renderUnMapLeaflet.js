module.exports = function renderUnMapLeaflet(block, meta, context) {
	
	let attributes = {
		// meta
		'data-theme': meta.theme,
		'data-page': meta.id,
		// block
		'data-width': block.width,
		'data-pintext': block.pintext,
		'data-pin': block.pin,
		'data-lat': block.coords[0],
		'data-lon': block.coords[1],

	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	let html = /* html */`
		<un-map-leaflet ${attStr}></un-map-leaflet>
	`
	return html

}