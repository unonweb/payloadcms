export default function renderLinkInternal(block = {}) {
		
	const linkedDoc = pages.find(p => p.id === block.link.rel.value)
	const title = (block.link.autoTitle === false) ? block.link.title : (typeof linkedDoc.title === 'string') ? linkedDoc.title : linkedDoc?.title[locale]

	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(linkedDoc?.slug) ? `href="/${locale}/${linkedDoc.slug}/"` : '', // subpage; use trailing slash so that anchor.href matches window.location.href
		(linkedDoc?.slug === '') ? `href="/${locale}/"` : '', // homepage
	].filter(item => item).join(' ') // remove empty strings

	let html = /* html */`<a ${attributes}>${title}</a>`

	return html
}