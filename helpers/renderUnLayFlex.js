module.exports = function renderUnLayFlex(block, meta, context) {

	const iterateBlocks = require('./iterateBlocks.js')

	const attributes = [
		// global
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
		// layout
		(block.layout) ? `data-layout="${block.layout}"` : '',
		(block.gap) ? `data-gap="${block.gap}%"` : '',
		(block.justify) ? `data-justify="${block.justify}"` : '',
		(block.align) ? `data-align="${block.align}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-lay-flex ${attributes}>
			${block.columnOne.blocks.length > 0
			? /* html */`<div class="col one">${iterateBlocks(block.columnOne.blocks, meta, context)}</div>`
			: ''
		}
			${block.columnTwo.blocks.length > 0
			? /* html */`<div class="col two">${iterateBlocks(block.columnTwo.blocks, meta, context)}</div>`
			: ''
		}
		</un-lay-flex>`;

	return html // returns a string
}