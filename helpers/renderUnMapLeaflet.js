export default function renderUnMapLeaflet(block = {}) {
	context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.css')
	context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.js')
	//filesToPageHead.add('/assets/lib/lit-3.1.0-all.js')
	context.libPathsWeb.add('/assets/custom-elements/un-map-leaflet.js')

	const attributes = [
		// global
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
		// functional
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