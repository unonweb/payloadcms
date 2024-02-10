export default function renderUnRT(block = {}) {

	let html

	if (!block.contentRichText) {
		//throw ReferenceError('"block.contentRichText" not found. Maybe localization missing?')
		log('"block.contentRichText" not found. Maybe localization missing?', site.domainShort, __filename, 4)
	}
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
		(block.textAlign) ? `data-text-align="${block.textAlign}"` : '',
		(block.bgMask) ? `data-bg-mask="${block.bgMask}"` : '',
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	html = /* html */`<un-rt ${attributes}>${renderLexicalHTML(block.contentRichText.root.children, context, locale)}</un-rt>`;

	return html.replace(/\s+/g, " ").trim()
}