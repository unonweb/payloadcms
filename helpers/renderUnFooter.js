export default function renderUnFooter(block = {}) {
	// footer
	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	const properties = [].join(' ')

	let html
	html = /* html */`
		<un-footer ${attributes} ${properties}>
			${render(block.blocks)}
		</un-footer>
	`

	return html
}