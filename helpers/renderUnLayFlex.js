export default function renderUnLayFlex(block = {}) {

	const attributes = [
		// layout
		(block.layout) ? `data-layout="${block.layout}"` : '',
		(block.gap) ? `data-gap="${block.gap}%"` : '',
		(block.justify) ? `data-justify="${block.justify}"` : '',
		(block.align) ? `data-align="${block.align}"` : '',
		// global
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-lay-flex ${attributes}>
			${block.columnOne.blocks.length > 0
			? /* html */`<div class="col one">${render(block.columnOne.blocks)}</div>`
			: ''
		}
			${block.columnTwo.blocks.length > 0
			? /* html */`<div class="col two">${render(block.columnTwo.blocks)}</div>`
			: ''
		}
		</un-lay-flex>`;

	return html // returns a string
}