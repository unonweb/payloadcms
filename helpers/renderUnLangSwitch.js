export default function renderUnLangSwitch(block, meta, context) {

	const attributes = [
		// meta
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(meta.slug) ? `data-page="${meta.slug}"` : '',
		// block
		(block.icon) ? `data-icon="${block.icon}"` : '',
	].filter(item => item).join(' ')

	const innerHTML = block.languages.map((lang) => {
		const textContent = (lang === 'de') ? 'Deutsch' : (lang === 'en') ? 'English' : ''
		return /* html */`
			<li class="lang">
				<button value="${lang}">${textContent}</button>
			</li>`
	}).join(' ')

	const html = /* html */`
		<un-lang-switch ${attributes}>
			<ul class="content">
				${innerHTML}
			</ul>
		</un-lang-switch>
	`;

	return html

}