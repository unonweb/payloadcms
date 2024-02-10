export default function renderUnDrawer(block = {}) {

	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	let html

	switch (block.trigger.type) {
		case 'hamburger':
			html = /* html */`
					<un-drawer ${attributes}>
						<un-hamburger slot="trigger" data-state="closed"></un-hamburger>
						${render(block.content.blocks)}
					</un-drawer>
				`
		case 'image':
			html = /* html */`
					<un-drawer ${attributes}>
						${renderImageset(block.trigger.image, context, { sizes: '10vw', loading: 'eager', slot: 'trigger' })}
						${render(block.content.blocks)}
					</un-drawer>
				`
		default:
			html = ''
	}

	return html

}