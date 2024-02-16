const iterateBlocks = require('./iterateBlocks.js');

module.exports = function renderUnNav(block, meta, context) {
	
	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
		// block
		(block.isDropDown) ? `data-dropdown="${block.isDropDown}"` : '',
		(block.sticky) ? `data-sticky="${block.sticky}"` : '',
		(block.enableSplit) ? `data-split="${block.enableSplit}"` : '',
	].filter(item => item).join(' ')

	let defaultHTML = ''
	if (block.blocks) {
		defaultHTML = /* html */`
			<ul class="content default">
				${block.blocks.map((block) => /* html */`<li>${iterateBlocks(block, meta, context)}</li>`).join(' ')}
			</ul>
		`
	}

	let offsetHTML = ''
	if (block.enableSplit && block.offset.length > 0) {
		offsetHTML = /* html */`
			<ul class="content offset">
				${block.offset.map((block) => /* html */`<li>${iterateBlocks(block, meta, context)}</li>`).join(' ')}
			</ul>
		`
	}

	const html = /* html */`
		<un-nav ${attributes}>
			${defaultHTML}
			${offsetHTML}
		</un-nav>
	`

	return html
}	