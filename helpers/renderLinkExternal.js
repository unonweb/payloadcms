module.exports = function renderLinkExternal(block, meta, context) {
	// blockType: 'link-external'
	// NOTES: 
	// * called by un-menu-bar

	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.slot) ? `slot="${block.slot}"` : '',
		(block.link.url) ? `href="${block.link.url}"` : '', // startpage
	].filter(item => item).join(' ')

	let html = /* html */`<a ${attributes}>${block.link.title}</a>`

	return html
}