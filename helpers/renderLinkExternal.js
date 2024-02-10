export default function renderLinkExternal(block = {}) {
	// blockType: 'link-external'
	// NOTES: 
	// * called by un-menu-bar

	const attributes = [
		(block.slot) ? `slot="${block.slot}"` : '',
		(block.link.url) ? `href="${block.link.url}"` : '', // startpage
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`<a ${attributes}>${block.link.title}</a>`

	return html
}