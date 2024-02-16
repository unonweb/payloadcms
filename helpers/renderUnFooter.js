module.exports = function renderUnFooter(block, meta, context) {

	const iterateBlocks = require('./iterateBlocks')
	
	// footer
	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
	].filter(item => item).join(' ')

	const properties = [].join(' ')

	let html
	html = /* html */`
		<un-footer ${attributes} ${properties}>
			${iterateBlocks(block.blocks, meta, context)}
		</un-footer>
	`

	return html
}