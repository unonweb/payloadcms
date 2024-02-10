import iterateBlocks from './iterateBlocks'
import renderImageset from './renderImageset'

export default function renderUnDrawer(block, meta, context) {

	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
	].filter(item => item).join(' ')

	let html

	switch (block.trigger.type) {
		case 'hamburger':
			html = /* html */`
				<un-drawer ${attributes}>
					<un-hamburger slot="trigger" data-state="closed"></un-hamburger>
					${iterateBlocks(block.content.blocks, meta, context)}
				</un-drawer>
				`
		case 'image':
			html = /* html */`
				<un-drawer ${attributes}>
					${renderImageset(block.trigger.image, meta, context, { sizes: '10vw', loading: 'eager', slot: 'trigger' })}
					${iterateBlocks(block.content.blocks, meta, context)}
				</un-drawer>
				`
		default:
			html = ''
	}

	return html

}