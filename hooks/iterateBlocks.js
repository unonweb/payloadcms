import {
	IS_BOLD,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	IS_CODE,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
} from './_lexicalNodeFormat';
import log from '../customLog'
import CustomError from '../customError'
import getAppMode from './_getAppMode'
import getDoc from './getDoc';


export default function iterateBlocks(doc, { user = '', locale = '', blocks = [], images = [], site = {}, pages = [], documents = [] } = {}) {
	// called for each page that is to be rendered

	if (documents.length === 0) {
		log('empty array: "documents"', user, __filename, 5)
	}
	if (images.length === 0) {
		log('empty array: "images"', user, __filename, 5)
	}
	if (pages.length === 0) {
		log('empty array: "pages"', user, __filename, 5)
	}

	const mode = getAppMode()
	let origin = site.paths.web.origin[mode]
	origin = (origin.endsWith('/')) ? origin.slice(0, -1) : origin // cut off trailing '/'
	const theme = site?.domainShort ?? ''
	const pathWebAssets = '/assets'
	const pathWebImgs = '/assets/imgs'
	const pathWebDocs = '/assets/docs'
	const pathWebPosts = '/assets/posts'
	const slug = (doc.slug === '') ? '/' : doc.slug
	const pathFSLib = `${site.paths.fs.admin.resources}/assets/lib`

	let html
	let libPathsWeb = new Set()
	let imgFiles = []
	let docFiles = []

	html = render(blocks); // action!
	html = html.replace(/\s+/g, " ").trim()
	// html = html.replace(/[\n\r\s]+/g, " ").trim()
	libPathsWeb = Array.from(libPathsWeb)
	return { html, imgFiles, docFiles, libPathsWeb }

	// --- render
	function render(blocks = {}, parentType = '', context = {}) {

		if (!Array.isArray(blocks)) {
			blocks = [blocks];
		}

		try {
			let html = blocks.map(block => {
				log(`render(): ${block.blockType}`, user, __filename, 7)
				switch (block.blockType) {

					// --- HEADER ---
					case 'header-banner':
						return renderUnHeaderBanner(block);

					// --- FOOTER ---
					case 'footer-default':
						return renderUnFooter(block);

					// --- LAYOUT ---
					case 'columns-fixed':
						return renderUnLayFixed(block);
					case 'columns-flex':
						return renderUnLayFlex(block);
					case 'include-posts':
						return renderUnPostsLit(block)

					// --- OTHER ---
					case 'drawer':
						return renderUnDrawer(block);
					case 'map-leaflet':
						return renderUnMapLeaflet(block);

					// --- TEXT ---
					case 'rich-text':
						return renderUnRT(block);
					case 'text':
					case 'textarea':
						return renderUnST(block)
					case 'contact-data':
						return renderUnContactData(block);

					// --- NAVS ---
					case 'nav':
						return renderUnNav(block);
					case 'nav-split':
						return renderUnNavSplit(block);

					case 'menu-aside':
						return renderUnMenuAside(block);
					case 'link-internal':
						return renderElLinkInternal(block)
						return renderUnA(block)
					case 'link-external':
						return renderElLinkExternal(block, parentType, context);
					case 'menu-drop-down':
						return renderUnDropDown(block);
					case 'lang-switch':
						return renderUnLangSwitch(block);

					// --- IMAGE ---
					case 'img':
						return renderUnImg(block);
					case 'img-slides':
						return renderUnImgSlides(block);
					case 'img-gallery':
						return renderUnImgGallery(block);
					//case 'img-background':
						//return renderUnImgBackground(block);

					// --- DEFAULT ---
					default:
						log(`blockType unknown: ${block.blockType}`, site.domainShort, __filename, 3);
				}
			})

			html = html.join(' ').replace(/\s+/g, " ")
			return html

		} catch (err) {
			log(err.stack, user, __filename, 3);
		}
	}

	// #HEADER ---

	function renderUnHeaderBanner(block = {}) {
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
				${(block.background.images.length > 0) 
					? block.background.images.map(img => `${ renderImageset(img.rel, { sizes: '100vw', loading: 'eager', slot: 'background', classes: 'background' }) }`).join(' ')
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

		/* <!-- OVERLAY 
					${block.overlay.images.map(img => {
						switch (img.link.type) {
							case "internal":
								return `
									<div class="overlay">
										<a href="${site.origin.dev}/${img.link.slug}">
											${renderImagesetEl({
												img: img.image,
												sizes: "15vw",
												loading: "eager",
											})}
										</a>
									</div>
								`;
							case "custom":
								return `
									<div class="overlay">
										<a href="https://${img.link.url}">
											${renderImagesetEl({
												img: img.image,
												sizes: "15vw",
												loading: "eager",
											})}
										</a>
									</div>
								`;
							case "none":
								return `
									<div class="overlay">
										${renderImagesetEl({
											img: img.image,
											sizes: "15vw",
											loading: "eager",
										})}
									</div>
								`;
						}
					}).join(' ')} */
	}

	// #FOOTER ---

	function renderUnFooter(block = {}) {
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

	// #OTHER

	function renderUnDrawer(block = {}) {
		
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
						${renderImageset(block.trigger.image, { sizes: '10vw', loading: 'eager', slot: 'trigger' })}
						${render(block.content.blocks)}
					</un-drawer>
				`
			default:
				html = ''
		}

		return html

	}

	function renderUnMapLeaflet(block = {}) {
		libPathsWeb.add('/assets/lib/leaflet-1.9.4.css')
		libPathsWeb.add('/assets/lib/leaflet-1.9.4.js')
		//filesToPageHead.add('/assets/lib/lit-3.1.0-all.js')
		libPathsWeb.add('/assets/custom-elements/un-map-leaflet.js')

		const attributes = [
			// global
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
			// functional
			(block.coords[0]) ? `data-lat="${block.coords[0]}"` : '',
			(block.coords[1]) ? `data-lon="${block.coords[1]}"` : '',
			(block.pin) ? `data-pin="${block.pin}"` : '',
			(block.pintext) ? `data-pintext="${block.pintext}"` : '',

		].filter(item => item).join(' ')

		let html = /* html */`
			<un-map-leaflet ${attributes}></un-map-leaflet>
		`
		return html

	}

	// #MENUS ---

	function renderUnNav(block = {}) {
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
					${block.blocks.map(b => /* html */`<li>${render(b)}</li>`).join(' ')}
				</ul>
			`
		}

		let offsetHTML = ''
		if (block.enableSplit && block.offset.length > 0) {
			offsetHTML = /* html */`
				<ul class="content offset">
					${block.offset.map(b => /* html */`<li>${render(b)}</li>`).join(' ')}
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

	function renderUnMenuAside(block = {}) {
		
		const attributes = [
			`role="navigation"`,
			(block.area) ? `data-area="${block.area}"` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html
		html = /* html */`
			<un-menu-aside ${attributes}>
				${render(block.blocks)}
			</un-menu-aside>
		`

		return html
	}

	// #LINKS ---

	function renderElLinkExternal(block = {}) {
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

	function renderUnA(block = {}) {
		
		const linkedDoc = pages.find(p => p.id === block.link.rel.value)
		const title = (block.link.autoTitle === true) ? linkedDoc?.title[locale] : block.link.title

		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(linkedDoc?.slug !== '') ? `data-href="/${locale}/${linkedDoc.slug}/"` : '', // subpage; use trailing slash so that anchor.href matches window.location.href
			(linkedDoc?.slug === '') ? `data-href="/${locale}/"` : '', // homepage
		].filter(item => item).join(' ')

		let html = /* html */`
			<un-a ${attributes}>${title}</un-a>
		`

		return html
	}

	function renderElLinkInternal(block = {}, parentType = '', context = {}) {
		//const linkedDoc = pages.find(p => p.id === block.link.rel.value && p.locale === locale) ?? pages.find(p => p.id === block.link.rel.value)
		// 1. look for a page that matches by id AND locale
		// 2. look for a page that matches by id

		const linkedDoc = pages.find(p => p.id === block.link.rel.value)
		const title = (block.link.autoTitle === true) ? linkedDoc?.title[locale] : block.link.title

		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(linkedDoc?.slug) ? `href="/${locale}/${linkedDoc.slug}/"` : '', // subpage; use trailing slash so that anchor.href matches window.location.href
			(linkedDoc?.slug === '') ? `href="/${locale}/"` : '', // homepage
		].filter(item => item).join(' ') // remove empty strings

		let html = /* html */`<a ${attributes}>${title}</a>`

		return html
	}

	function renderUnLangSwitch(block = {}) {

		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
			(block.icon) ? `data-icon="${block.icon}"` : '',
		].filter(item => item).join(' ')

		const innerHTML = block.languages.map(lang => {
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

	function renderUnDropDown(block = {}) {
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

	// #LAYOUT ---

	function renderUnLayFixed(block = {}) {

		const attributes = [
			(block.justify) ? `data-justify="${block.justify}"` : '',
			(block.align) ? `data-align="${block.align}"` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html = /* html */`
			<un-lay-fixed ${attributes}>
				${block.columns.map(col => /* html */`<div data-width="${col.width}">${ render(col.blocks)}</div>`).join(' ') }
			</un-lay-fixed>
		`

		return html
	}

	function renderUnLayFlex(block = {}) {

		const attributes = [
			// layout
			(block.layout) ? `data-layout="${block.layout}"` : '',
			(block.gap) ? `data-gap="${block.gap}%"` : '',
			(block.justify) ? `data-justify="${block.justify}"` : '',
			(block.align) ? `data-align="${block.align}"` : '',
			// global
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html = /* html */`
			<un-lay-flex ${attributes}>
				${block.columnOne.blocks.length > 0
				? /* html */`<div class="col one">${render(block.columnOne.blocks)}</div>`
				: ''
			}
				${block.columnTwo.blocks.length > 0
				? /* html */`<div class="col two">${render(block.columnTwo.blocks)}</div>`
				: ''
			}
			</un-lay-flex>`;

		return html
	}

	function renderUnPostsLit(block = {}) {
		libPathsWeb.add('/assets/lib/lit-3.1.0-all.js')
		libPathsWeb.add('/assets/custom-elements/un-posts-lit.js')
		//const includeSummary = block?.meta?.include?.includes('summary')
		//const includeImage = block?.meta?.include?.includes('image')

		// attributes
		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
			(locale) ? `lang="${locale}"` : '',
			(locale) ? `src="${`${pathWebPosts}/${locale}/posts.json`}"` : '',
			(block?.meta?.dateStyle) ? `date-style="${block.meta.dateStyle}"` : '',
			(block?.meta?.include) ? `post-parts="${block.meta.include.join(' ')}"` : '',
			(block?.meta?.isCollapsible) ? "collapsible" : '', // boolean property
			(block?.ui?.include) ? `ui-parts="${block.ui.include.join(' ')}"` : '',
			//(block.categories) ? `categories="${block.categories.map(c => c.name).join(' ')}"` : '',
			(block.tags) ? `tags="${block.tags.join(' ')}"` : '',
		].join(' ')

		let html = /* html */`<un-posts-lit ${attributes}></un-posts-lit>`

		return html
	}

	// #IMAGES ---

	function renderUnImgGallery(block = {}) {
		// blockType = 'img-gallery'
		
		const attributes = [
			// global
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
			// functional
			(block.onclick) ? `data-onclick=${block.onclick}` : '',
			(block.modal) ? `data-modal=${block.modal}` : '',
			// layout
			(block.number) ? `data-number=${block.number}` : '',
			(block.justify) ? `data-justify=${block.justify}` : '',
			// style
			(block.shape) ? `data-shape=${block.shape}` : '',
			(block.filter) ? `data-filter=${block.filter}` : '',
			(block.hover.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
		].filter(item => item).join(' ')

		let html = /* html */`
			<un-img-gallery ${attributes}>
				${block.images.map(img => {
					switch (img.link.type) {
						case 'internal':
							return /* html */`<a href="${origin}/${img.link.slug}" slot="gallery">${renderImageset(img.rel, { sizes: '50vw', loading: 'eager' })}</a>`;
						case 'custom':
							return /* html */`<a href="${img.link.url}" slot="gallery">${renderImageset(img.rel, { sizes: '50vw', loading: 'eager' })}</a>`;
						case 'none':
							return renderImageset(img.rel, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
						case 'undefined':
							log('linkType == undefined', user, __filename, 4);
					}
				}).join('')}
			</un-img-gallery>`;

		return html
	}

	function renderUnImgSlides(block = {}) {
		
		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].join(' ')

		let html = /* html */`	
			<un-img-slides ${attributes} arrows="true" bullets="true" thumbnails="0" autoslide="false">
				${block.images.map((img) => renderImageset(img, { loading: "lazy" }))}
			</un-img-slides>
		`;

		return html
	}

	function renderUnImg(block = {}) {
		/* NOTES:
			- not working with images in RichText content because they're only referenced 
		*/

		const attributes = [
			(block.size) ? `data-size=${block.size}` : '',
			(block.shape) ? `data-shape=${block.shape}` : '',
			(block.filter) ? `data-filter=${block.filter}` : '',
			(block.hover.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
			(block.mask) ? `data-mask=${block.mask}` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html = ''

		if (block.rel) {
			switch (block.link.type) {
				case 'none':
				case 'undefined':
					html = /* html */`
						<un-img ${attributes}>		
							${renderImageset(block.rel)}
						</un-img>
					`;
					break
				case 'internal':
					const linkedDoc = pages.find(p => p.id === block.link.rel.value && p.locale === locale) ?? pages.find(p => p.id === block.link.rel.value)
					const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
					html = /* html */`
						<a href="${origin}/${slug}">
							<un-img ${attributes}>${renderImageset(block.rel)}</un-img>
						</a>
					`;
					break
				case 'custom':
					html = /* html */`
						<a href="${block.link.url}">
							<un-img ${attributes}>${renderImageset(block.rel)}</un-img>
						</a>
					`;
					break
				default:
					throw CustomError('linkType unknown', site.domainShort, __filename);
			}
		}

		return html
	}

	function renderUnImgBackground(block = {}) {
		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		const html = /* html */`
			<un-background><un-background>
		`
	}

	// #TEXT

	function renderUnRT(block = {}) {

		let html

		if (!block.contentRichText) {
			//throw ReferenceError('"block.contentRichText" not found. Maybe localization missing?')
			log('"block.contentRichText" not found. Maybe localization missing?', site.domainShort, __filename, 4)
		}
		// now contentRichText is converted server side by an afterRead hook
		// for backwards compatibility check if contentRichText is a string
		// - if yes we can suppose that it's html
		// - if no we convert it
		/* if (typeof block.contentRichText !== 'string') {
			log('contentRichText is not a string! Try to convert it...', site.domainShort, __filename, 7)

			//block.contentRichText = $generateHtmlFromNodes(block.contentRichText, null)
			//block.contentRichText = convertSlateRTtoHTML(block.contentRichText);
			block.contentRichText = serializeLexical(block.contentRichText.root.children)
		} */

		const attributes = [
			(block.textAlign) ? `data-text-align="${block.textAlign}"` : '',
			(block.bgMask) ? `data-bg-mask="${block.bgMask}"` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		html = /* html */`<un-rt ${attributes}>${serializeLexical(block.contentRichText.root.children)}</un-rt>`;

		return html.replace(/\s+/g, " ").trim()
	}

	function renderUnST(block = {}) {

		const attributes = [
			(block.formatting) ? `data-formatting=${block.formatting.join(' ')}` : '',
			(slug) ? `data-page="${slug}"` : '',
		].join(' ')

		const headingOpen = (block.heading)
			? `<${block.heading}>`
			: ''

		const headingClose = (block.heading)
			? `</${block.heading}>`
			: ''

		let html = /* html */ `
			<un-st ${attributes}>
				${headingOpen}${block.text}${headingClose}
			</un-st>
		`;

		return html
	}

	function renderUnContactData(block = {}) {

		/* const properties = [
			(block.name) ? `@name="${block.name}"` : '',
			(block.street) ? `@street="${block.street}"` : '',
			(block.number) ? `@number="${block.number}"` : '',
			(block.postcode) ? `@postcode="${block.postcode}"` : '',
			(block.place) ? `@place="${block.place}"` : '',
			(block.email) ? `@email="${block.email}"` : '',
			(block.phone) ? `@phone="${block.phone}"` : '',
		].join(' ') */

		const attributes = []
		const properties = []

		const innerHtml = [
			(block.name) ? `<span class='name'>${block.name}</span>` : '',
			(block.street) ? `<span class='street'>${block.street}</span>` : '',
			(block.number) ? `<span class='number'>${block.number}</span>` : '',
			(block.postcode) ? `<span class='postcode'>${block.postcode}</span>` : '',
			(block.place) ? `<span class='place'>${block.place}</span>` : '',
			(block.email) ? `<a href='mailto:info@haerer-geruestbau.de'>${block.email}</a>` : '',
			(block.phone) ? `<span class='phone'>${block.phone}</span>` : '',
		].join(' ')

		let html = /* html */ `
			<un-contact ${attributes} ${properties}>
				${innerHtml}
			</un-contact>
		`;

		return html

	}

	// --- ELEMENTS ---

	function serializeLexical(children) {
		if (!Array.isArray(children)) {
			children = children.children
		}

		const htmlArray = children.map((node) => {

			// get classes
			let classes = [
				(node.format && typeof node.format === 'string') ? node.format : '',
				(node.format & IS_STRIKETHROUGH) ? 'line-through' : '',
				(node.format & IS_UNDERLINE) ? 'underline' : '',
				(node.indent > 0) ? `indent-${node.indent}` : '',
			].filter(item => item)

			// node.type === text
			if (node.type === 'text') {
				
				let attributes = [
					(classes.length > 0) ? ` class="${classes.join(' ')}"` : ''
				].filter(item => item).join(' ')

				//let text = `${escapeHTML(node.text)}`;

				let text = `${node.text}`;
				let tag = ''
				
				// get tag
				if (node.format) {
					if (node.format & IS_BOLD) tag = 'strong'
					//text = `<strong class="${classes}">${text}</strong>`;
					if (node.format & IS_ITALIC) tag = 'em'
					//text = /* html */`<em class="${classes}">${text}</em>`;
					if (node.format & IS_CODE) tag = 'code'
					//text = /* html */`<code class="${classes}">${text}</code>`;
					if (node.format & IS_SUBSCRIPT) tag = 'sub'
					//text = /* html */`<sub class="${classes}">${text}</sub>`;
					if (node.format & IS_SUPERSCRIPT) tag = 'sup'
					//text = /* html */`<sup>${text}</sup>`;
					if (node.format & IS_STRIKETHROUGH || node.format & IS_UNDERLINE) tag = 'span'	
				}

				if (tag) {
					return `<${tag}${attributes}>${text}</${tag}>`;	
				} 
				else {
					return `${text}`;
				}
			}

			// node is null
			if (!node) {
				return null;
			}

			// serialize innerHTML
			const innerHTML = (node.children) ? serializeLexical(node.children) : null;

			// serialize outerHTML
			let classStr = ''
			let attributes = []
			switch (node.type) {

				// --- linebreak
				case 'linebreak':
					return /* html */`<br>`
				
				// --- link
				case 'link':

					let href = ''
					// --- linkType
					switch (node.fields.linkType) {
						case 'custom':
							href = node.fields.url	
							break
						case 'internal':
							let linkedDoc = {}
							switch (node.fields.doc.relationTo) {
								// link -> pages
								case 'pages':
									linkedDoc = pages.find(page => (typeof node.fields.doc.value === 'string') 
										? page.id === node.fields.doc.value 
										: page.id === node.fields.doc.value.id
									)
									href = linkedDoc.url
									break;
								// link -> posts
								case 'posts':
									// const linkedDoc = await getDoc('posts', node.fields.doc.value, user, { depth: 0, locale: locale }) <-- FIX!
									log('Link to posts in rich-text not implemented yet', user, __filename, 5)
									break;
								// link -> documents
								case 'documents':
									linkedDoc = documents.find(doc => (typeof node.fields.doc.value === 'string') 
										? doc.id === node.fields.doc.value 
										: doc.id === node.fields.doc.value.id
									)
									if (linkedDoc?.filename) {
										docFiles.push(linkedDoc.filename)
										href = `${pathWebDocs}/${linkedDoc.filename}`
									}
									break
								// link -> images
								case 'images':
									linkedDoc = images.find(img => (typeof node.fields.doc.value === 'string') 
										? img.id === node.fields.doc.value
										: img.id === node.fields.doc.value.id
									)
									if (linkedDoc?.filename) {
										imgFiles.push(linkedDoc.filename)
										href = `${pathWebImgs}/${linkedDoc.filename}`
									}
									break
							}
					}

					if (!href) throw Error(`href is "${href}"`)

					attributes = [
						`href="${href}"`,
						(node.fields?.isDownload === true) ? `download=""` : '',
						(node.fields.newTab === true) ? 'target="_blank"' : '',
						(node.fields?.rel) ? `rel="${node.fields?.rel}"` : '',
						(classes.length > 0) ? ` class="${classes.join(' ')}"` : ''
					].filter(item => item).join(' ')

					return /* html */`<a ${attributes}>${innerHTML}</a>`

				// --- list
				case 'list': // <-- !IMP: handle properly, especially nested lists
					if (node.listType === 'bullet') {
						return /* html */`<ul>${innerHTML}</ul>`
					} else {
						return /* html */`<ol>${innerHTML}</ol>`
					}

				// --- listitem
				case 'listitem':
					return /* html */`<li>${innerHTML}</li>`

				// --- heading
				case 'heading':
					classStr = (classes.length > 0) ? `class="${classes.join(' ')}"` : ''
					return `<${node.tag} ${classStr}>${innerHTML}</${node.tag}>`
				
				// --- upload
				case 'upload':
					return /* html */`<un-img data-float="left">${renderImageset(node.value.id)}</un-img>` // <-- ATT: hard-coded value
				
				// --- paragraph
				case 'paragraph':
					classStr = (classes.length > 0) ? `class="${classes.join(' ')}"` : ''
					return /* html */`<p ${classStr}>${innerHTML ? innerHTML : '<br>'}</p>`;
				
				// --- default
				default: 
					// Probably just a normal paragraph
					return /* html */`<p class="${classes}">${innerHTML ? innerHTML : '<br>'}</p>`;
			}
		}).filter((node) => node)

		return htmlArray.join('') // no space!
	}

	function convertSlateRTtoHTML(rtContent) {
		// receives slate richtText content
		// returns a html string

		// main
		if (Array.isArray(rtContent)) {
			// [children]...
			return rtContent.reduce((output, node) => {
				// returns a single value which is calculated based on the array
				const isTextNode = _isText(node);
				//const isTextNode = (node.type) ? false : true

				const { text, bold, code, italic, underline, strikethrough } =
					node; // erstellt sechs Variablen mit dem Inhalt von node.text, node.bold,...

				if (isTextNode) {
					// convert straight single quotations to curly
					// "\u201C" is starting double curly
					// "\u201D" is ending double curly
					let html = text?.replace(/'/g, "\u2019"); // single quotes

					if (bold) {
						html = `<strong>${html}</strong>`;
					}

					if (code) {
						html = `<code>${html}</code>`;
					}

					if (italic) {
						html = `<em>${html}</em>`;
					}

					if (underline) {
						html = `<span style="text-decoration: underline;">${html}</span>`;
					}

					if (strikethrough) {
						html = `<span style="text-decoration: line-through;">${html}</span>`;
					}

					//console.log('adding html: ', html)
					return `${output}${html}`;
				}

				if (node) {
					let nodeHTML;
					// check node.type
					switch (node.type) {
						case "h1":
							nodeHTML = `<h1>${convertSlateRTtoHTML(node.children)}</h1>`;
							break;

						case "h2":
							nodeHTML = `<h2>${convertSlateRTtoHTML(node.children)}</h2>`;
							break;

						case "h3":
							nodeHTML = `<h3>${convertSlateRTtoHTML(node.children)}</h3>`;
							break;

						case "h4":
							nodeHTML = `<h4>${convertSlateRTtoHTML(node.children)}</h4>`;
							break;

						case "h5":
							nodeHTML = `<h5>${convertSlateRTtoHTML(node.children)}</h5>`;
							break;

						case "h6":
							nodeHTML = `<h6>${convertSlateRTtoHTML(node.children)}</h6>`;
							break;

						case "ul":
							nodeHTML = `<ul>${convertSlateRTtoHTML(node.children)}</ul>`;
							break;

						case "ol":
							nodeHTML = `<ol>${convertSlateRTtoHTML(node.children)}</ol>`;
							break;

						case "li":
							nodeHTML = `<li>${convertSlateRTtoHTML(node.children)}</li>`;
							break;

						case "link":
							if (node.linkType === 'internal') {
								// internal link
								const attributes = [
									(node?.fields?.isDownloadLink === true) ? `download=""` : '',
									(node.doc.value.filename) ? `href="${pathWebAssets}/${node.doc.value.filename}"` : '',
								].filter(item => item).join(' ')

								nodeHTML = `<a ${attributes}>${convertSlateRTtoHTML(node.children)}</a>`;
							}
							else {
								// external link
								nodeHTML = `<a href="${node.url}">${convertSlateRTtoHTML(node.children)}</a>`;
							}
							break;

						case "relationship":
							nodeHTML = `<strong>Relationship to ${node.relationTo}: ${node.value}</strong><br/>`;
							break;

						/* IMAGE */

						case "upload":
							//nodeHTML = `<un-img>${_createImgSrcSetEl(node.value, webImgDir)}</un-img>`
							nodeHTML = renderImageset(node.value)
							break;

						case "p":
						case undefined:
							nodeHTML = `<p>${convertSlateRTtoHTML(node.children)}</p>`;
							break;

						default:
							nodeHTML = `<strong>${node.type}</strong>:<br/>${JSON.stringify(node)}`;
							break;
					}

					//console.log('adding html: ', nodeHTML)
					return `${output}${nodeHTML}\n`;
				}

				return output;
				// end of content.reduce()
			}, "");
		}

		function _isText(value) {
			// copied from Slate

			function isPlainObject(o) {
				var ctor, prot;

				if (isObject(o) === false) return false;

				// If has modified constructor
				ctor = o.constructor;
				if (ctor === undefined) return true;

				// If has modified prototype
				prot = ctor.prototype;
				if (isObject(prot) === false) return false;

				// If constructor does not have an Object-specific method
				if (prot.hasOwnProperty("isPrototypeOf") === false) {
					return false;
				}

				// Most likely a plain Object
				return true;
			}

			function isObject(o) {
				return Object.prototype.toString.call(o) === "[object Object]";
			}

			return isPlainObject(value) && typeof value.text === "string";
		}

		/* function _createImgSrcSetEl(img, webImgDir = '', images = {}) {
			// use this local variant instead of the static UnApp method
			// because we need it to return plain html

			if (typeof img === 'string') {
				// looks like we've got just an id reference to the images collection
				//img = images.docs.find(item => item.id === img)
				img = images[item.id]
			}

			let imgEl;

			if (!img.sizes) { // try reassigning one lvl down
				img = img.image
			}

			if (img.sizes) {
				// if there are different sizes...
				let imgSizes = img.sizes;

				let img1920Str = imgSizes.img1920.filename
					? `${webImgDir}/${imgSizes.img1920.filename} 1920w, `
					: "";
				let img1600Str = imgSizes.img1600.filename
					? `${webImgDir}/${imgSizes.img1600.filename} 1600w, `
					: "";
				let img1366Str = imgSizes.img1366.filename
					? `${webImgDir}/${imgSizes.img1366.filename} 1366w, `
					: "";
				let img1024Str = imgSizes.img1024.filename
					? `${webImgDir}/${imgSizes.img1024.filename} 1024w, `
					: "";
				let img768Str = imgSizes.img768.filename
					? `${webImgDir}/${imgSizes.img768.filename} 768w, `
					: "";
				let img640Str = imgSizes.img640.filename
					? `${webImgDir}/${imgSizes.img640.filename} 640w, `
					: "";
				let imgOriginal = `${webImgDir}/${img.filename}`;

				imgEl = `
				<img
					srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}${imgOriginal}"
					sizes="
						(max-width: 640px) 640px, 
						(max-width: 768px) 768px, 
						(max-width: 1024px) 1024px,
						(max-width: 1366px) 1366px,
						(max-width: 1600px) 1600px,
						1920px"
					>
				`;
			} else if (img.filename) {
				// if there is just one size...
				imgEl = `<img src="${webImgDir}/${img.filename}">`;
			} else {
				throw CustomError(`${img} does not contain image properties`, site.domainShort, __filename)
			}

			return imgEl;
		} */

		return ''
	}

	function renderImageset(img, { sizes = '100vw', loading = 'eager', slot = '', classes = '' } = {}) {
		// * requires global images = []

		try {
			let id

			if (typeof img === 'string') {
				id = img
				img = images.find(item => item.id === id)
			}
			if (typeof img === 'undefined') {
				throw CustomError(`could not find img "${id}" for "${slug}" with locale "${locale}" in images collection`, user, __filename, 4)
			}

			let html

			if (img.sizes) {
				// if there are different sizes...

				let imgSrc = '', imgOrgSrc = '', img1920Src = '', img1600Src = '', img1366Src = '', img1024Src = '', img768Src = '', img640Src = ''

				if (img.filename) {
					imgFiles.push(img.filename)
					imgSrc = `${pathWebImgs}/${img.filename}`
					imgOrgSrc = `${pathWebImgs}/${img.filename} ${img.width}w, `
				}
				if (img.sizes.img1920.filename) {
					imgFiles.push(img.sizes.img1920.filename)
					img1920Src = `${pathWebImgs}/${img.sizes.img1920.filename} 1920w, `
				}
				if (img.sizes.img1600.filename) {
					imgFiles.push(img.sizes.img1600.filename)
					img1600Src = `${pathWebImgs}/${img.sizes.img1600.filename} 1600w, `
				}
				if (img.sizes.img1366.filename) {
					imgFiles.push(img.sizes.img1366.filename)
					img1366Src = `${pathWebImgs}/${img.sizes.img1366.filename} 1366w, `
				}
				if (img.sizes.img1024.filename) {
					imgFiles.push(img.sizes.img1024.filename)
					img1024Src = `${pathWebImgs}/${img.sizes.img1024.filename} 1024w, `
				}
				if (img.sizes.img768.filename) {
					imgFiles.push(img.sizes.img768.filename)
					img768Src = `${pathWebImgs}/${img.sizes.img768.filename} 768w, `
				}
				if (img.sizes.img640.filename) {
					imgFiles.push(img.sizes.img640.filename)
					img640Src = `${pathWebImgs}/${img.sizes.img640.filename} 640w, `
				}

				const attributes = [
					(img.alt) ? `alt="${img.alt}"` : '',
					(img.height) ? `height="${img.height}"` : '',
					(img.width) ? `width="${img.width}"` : '',
					(slot) ? `slot="${slot}"` : '',
					(loading) ? `loading="${loading}"` : '',
					(classes) ? `class="${classes}"` : '',
					(slug) ? `id="${doc.slug}-${img.id}"` : `id="${doc.title.toLowerCase()}-${img.id}"` // slug is undefined for posts
				].filter(item => item).join(' ')

				html = /* html */`
					<img
						src="${imgSrc}"
						srcset="${imgOrgSrc}${img1920Src}${img1600Src}${img1366Src}${img1024Src}${img768Src}${img640Src}"
						sizes="${sizes}"
						${attributes}
					>
				`;
			} else if (img.filename) {
				// if there is just one size...
				html = /* html */`<img src="${imgSrc}" ${attributes} >`
			} else {
				throw CustomError(`${img} does not contain image properties`)
			}

			return html

		} catch (err) {
			log(err.stack, user, __filename, 4)
		}
	}
}