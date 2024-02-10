export default function renderLinkInternal(block, meta, context) {
	/*
		Arguments:
			- context.pages
			- meta.locale
	*/
	const locale = meta.locale
	const pages = context.pages.docs

	const linkedDoc = pages.find(p => p.id === block.link.rel.value)
	const title = (block.link.autoTitle === false) ? block.link.title : (typeof linkedDoc.title === 'string') ? linkedDoc.title : linkedDoc?.title[locale]

	const attributes = [
		(meta.theme) ? `data-theme="${meta.theme}"` : '',
		(linkedDoc?.slug) ? `href="/${locale}/${linkedDoc.slug}/"` : '', // subpage; use trailing slash so that anchor.href matches window.location.href
		(linkedDoc?.slug === '') ? `href="/${locale}/"` : '', // homepage
	].filter(item => item).join(' ') // remove empty strings

	let html = /* html */`<a ${attributes}>${title}</a>`

	return html
}