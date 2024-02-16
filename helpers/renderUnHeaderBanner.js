module.exports = function renderUnHeaderBanner(block, meta, context) {

	const iterateBlocks = require('./iterateBlocks')
	
	// blockType: 'header-banner'
	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
		// block
		(block.transfx) ? `data-transfx="${block.transfx}"` : '',
		(block.transtime) ? `data-shape=${block.transtime}` : '',
		(block.filter) ? `data-filter=${block.filter}` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-header-banner ${attributes}>
			<!--- BACKGROUND --->
			${(block.background.blocks) 
				? iterateBlocks(block.background.blocks, meta, context)
				: ''
			}
			<!--- OVERLAY --->
			<div class="overlay">
				${(block.overlay.blocks) 
					? iterateBlocks(block.overlay.blocks, meta, context)
					: ''
				}
			</div>
		</un-header-banner>`

	return html
}