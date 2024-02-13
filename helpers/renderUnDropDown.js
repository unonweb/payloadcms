const iterateBlocks = require('./iterateBlocks.js');

module.exports = function renderUnDropDown(block, meta, context) {
	// block.title
	// block.subMenu
	
	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.openOn) ? `data-openon="${block.openOn}"` : '',
		(block.overlay) ? `data-overlay="${block.overlay}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-drop-down ${attributes}>
			<button slot="head">${block.title}</button>
				${iterateBlocks(block.blocks, meta, context)}
		</un-drop-down>
	`;

	return html
}