const renderLexicalHTML = require('./renderLexicalHTML')

module.exports = function renderUnRT(block, meta, context) {

	let html

	// now contentRichText is converted server side by an afterRead hook
	// for backwards compatibility check if contentRichText is a string
	// - if yes we can suppose that it's html
	// - if no we convert it
	/* if (typeof block.contentRichText !== 'string') {
		log('contentRichText is not a string! Try to convert it...', site.domainShort, __filename, 7)

		//block.contentRichText = $generateHtmlFromNodes(block.contentRichText, null)
		//block.contentRichText = convertSlateRTtoHTML(block.contentRichText);
		block.contentRichText = serializeLexical(block.contentRichText.root.children)
	} */

	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block attributes
		(block.textAlign) ? `data-text-align="${block.textAlign}"` : '',
		(block.bgMask) ? `data-bg-mask="${block.bgMask}"` : '',
	].filter(item => item).join(' ')

	html = /* html */`<un-rt ${attributes}>${renderLexicalHTML(block.contentRichText.root.children, meta, context)}</un-rt>`;

	return html.replace(/\s+/g, " ").trim()
}