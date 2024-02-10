export default function renderUnNav(block = {}) {
	// blockType: 'menu-bar'
	
	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
		(block.isDropDown) ? `data-dropdown="${block.isDropDown}"` : '',
		(block.sticky) ? `data-sticky="${block.sticky}"` : '',
		(block.enableSplit) ? `data-split="${block.enableSplit}"` : '',
	].filter(item => item).join(' ')

	let defaultHTML = ''
	if (block.blocks) {
		defaultHTML = /* html */`
			<ul class="content default">
				${block.blocks.map((b) => /* html */`<li>${render(b)}</li>`).join(' ')}
			</ul>
		`
	}

	let offsetHTML = ''
	if (block.enableSplit && block.offset.length > 0) {
		offsetHTML = /* html */`
			<ul class="content offset">
				${block.offset.map((b) => /* html */`<li>${render(b)}</li>`).join(' ')}
			</ul>
		`
	}

	const html = /* html */`
		<un-nav ${attributes}>
			${defaultHTML}
			${offsetHTML}
		</un-nav>
	`

	return html
}	