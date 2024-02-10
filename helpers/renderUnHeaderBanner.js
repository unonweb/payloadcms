export default function renderUnHeaderBanner(block = {}) {
	// blockType: 'header-banner'
	
	const attributes = [
		(block.transfx) ? `data-transfx="${block.transfx}"` : '',
		(block.transtime) ? `data-shape=${block.transtime}` : '',
		(block.filter) ? `data-filter=${block.filter}` : '',
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
	].filter(item => item).join(' ')

	let html = /* html */`
		<un-header-banner ${attributes}>
			<!--- BACKGROUND --->
			${(block.background.blocks) 
				? render(block.background.blocks)
				: ''
			}
			<!--- OVERLAY --->
			<div class="overlay">
				${(block.overlay.blocks) 
					? render(block.overlay.blocks)
					: ''
				}
			</div>
		</un-header-banner>`

	return html
}