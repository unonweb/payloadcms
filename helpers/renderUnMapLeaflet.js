module.exports = function renderUnMapLeaflet(block, meta, context) {
	
	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.coords[0]) ? `data-lat="${block.coords[0]}"` : '',
		(block.coords[1]) ? `data-lon="${block.coords[1]}"` : '',
		(block.pin) ? `data-pin="${block.pin}"` : '',
		(block.pintext) ? `data-pintext="${block.pintext}"` : '',

	].filter(item => item).join(' ')

	let html = /* html */`
		<un-map-leaflet ${attributes}></un-map-leaflet>
	`
	return html

}