const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderUnRT(block, meta, context) {

	let html

	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.id) ? `data-page="${meta.id}"` : '',
		// block attributes
		(block.textAlign) ? `data-text-align="${block.textAlign}"` : '',
		(block.bgMask) ? `data-bg-mask="${block.bgMask}"` : '',
	].filter(item => item).join(' ')

	html = /* html */`<un-rt ${attributes}>${renderLexicalHTML(block.contentRichText.root.children, meta, context)}</un-rt>`;

	return html.replace(/\s+/g, " ").trim()
}