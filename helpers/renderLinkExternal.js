module.exports = function renderLinkExternal(block, meta, context) {
	// blockType: 'link-external'
	// NOTES: 
	// * called by un-menu-bar

	/* const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		// block
		(block.slot) ? `slot="${block.slot}"` : '',
		(block.link.url) ? `href="${block.link.url}"` : '', // startpage
	].filter(item => item).join(' ') */

	let attributes = {
		// meta
		//'data-theme': meta.theme,
		//'data-page': meta.id,
		// block
		'slot': block.slot,
		'href': block.link.url,
	}

	const attStr = Object.entries(attributes).filter(entry => entry[1]).map(entry => `${entry[0]}='${entry[1]}'`).reduce((prev, curr) => `${prev} ${curr}`, '')

	let html = /* html */`<a ${attStr}>${block.link.title}</a>`

	return html
}