export default function renderUnDropDown(block = {}) {
	// block.title
	// block.subMenu
	
	const attributes = [
		(block.openOn) ? `data-openon="${block.openOn}"` : '',
		(block.overlay) ? `data-overlay="${block.overlay}"` : '',
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-drop-down ${attributes}>
			<button slot="head">${block.title}</button>
				${render(block.blocks)}
		</un-drop-down>
	`;

	return html
}