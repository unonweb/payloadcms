import iterateBlocks from './iterateBlocks'

export default function renderUnFooter(block, meta, context) {
	// footer
	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
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