import log from './customLog'
import renderLexicalHTML from './renderLexicalHTML.js'; // commonjs // works in dev mode
import renderImageset from './renderImageset.js'; // commonjs // works in dev mode

export default function iterateBlocks(doc, blocks = [], locale = '', context) {
	// called for each page that is to be rendered

	context.slug = (doc.slug === '') ? '/' : doc.slug
	context.title = doc.title
	context.origin = context.site.paths.web.origin[context.mode]
	context.origin = (context.origin.endsWith('/')) ? context.origin.slice(0, -1) : context.origin // cut off trailing '/'
	context.theme = context.site?.domainShort ?? ''
	context.pathWebImgs = '/assets/imgs'
	context.pathWebPosts = '/assets/posts'
	context.pathWebDocs = '/assets/docs'
	context.pathFSLib = `${context.site.paths.fs.admin.resources}/assets/lib`
	context.locale ??= locale

	const pages = context.pages.docs
	const images = context.images.docs
	const documents = context.documents.docs
	const slug = context.slug
	const origin = context.origin
	const user = context.user
	const theme = context.theme
	const title = context.title
	const mode = context.mode
	const pathWebImgs = context.pathWebImgs
	const pathWebPosts = context.pathWebPosts
	const pathWebAssets = '/assets'
	const pathWebDocs = context.pathWebDocs
	const pathFSLib = context.pathFSLib

	/* checks */
	if (!context.documents || context.documents?.length === 0) {
		log('empty array: "documents"', user, __filename, 5)
	}
	if (!context.images || context.images?.length === 0) {
		log('empty array: "images"', user, __filename, 5)
	}
	if (!context.pages || context.pages?.length === 0) {
		log('empty array: "pages"', user, __filename, 5)
	}

	context.imgFiles = []
	context.docFiles = []
	context.libPathsWeb = new Set()
	
	let html
	
	html = render(blocks); // action!
	
	html = html.replace(/\s+/g, " ").trim()
	// html = html.replace(/[\n\r\s]+/g, " ").trim()
	const imgFiles = context.imgFiles
	const docFiles = context.docFiles
	let libPathsWeb = context.libPathsWeb
	libPathsWeb = Array.from(libPathsWeb)
	return { html, imgFiles, docFiles, libPathsWeb }

	// --- render
	function render(blocks = {}, parentType = '', context = {}) {

		if (!Array.isArray(blocks)) {
			blocks = [blocks];
		}

		try {
			let html = blocks.map((block) => {

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

					// --- POSTS ---
					case 'include-posts-flex':
						return renderUnPostsFlex(block);

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
						return renderLinkInternal(block)
					case 'link-external':
						return renderElLinkExternal(block, parentType, context);
					case 'menu-drop-down':
						return renderUnDropDown(block);
					case 'lang-switch':
						return renderUnLangSwitch(block);

					// --- IMAGE ---
					case 'un-img':
						return renderUnImg(block);
					case 'img':
						return renderImg(block);
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
						${renderImageset(block.trigger.image, context, { sizes: '10vw', loading: 'eager', slot: 'trigger' })}
						${render(block.content.blocks)}
					</un-drawer>
				`
			default:
				html = ''
		}

		return html

	}

	function renderUnMapLeaflet(block = {}) {
		context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.css')
		context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.js')
		//filesToPageHead.add('/assets/lib/lit-3.1.0-all.js')
		context.libPathsWeb.add('/assets/custom-elements/un-map-leaflet.js')

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

	/* function renderUnMenuAside(block = {}) {
		
		const attributes = [
			`role="navigation"`,
			(block.area) ? `data-area="${block.area}"` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html
		html = `
			<un-menu-aside ${attributes}>
				${render(block.blocks)}
			</un-menu-aside>
		`

		return html
	} */

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

	function renderLinkInternal(block = {}) {
		
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

	function renderUnLangSwitch(block = {}) {

		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
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

	/* function renderUnLayFixed(block = {}) {

		const attributes = [
			(block.justify) ? `data-justify="${block.justify}"` : '',
			(block.align) ? `data-align="${block.align}"` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		const innerHTML = block.columns.map((col) => `<div data-width="${col.width}">${render(col.blocks)}</div>`)

		const html = `
			<un-lay-fixed ${attributes}>
				${innerHTML.join(' ') }
			</un-lay-fixed>
		`

		return html
	} */

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

		return html // returns a string
	}

	function renderUnPostsFlex(block = {}) {
		context.libPathsWeb.add('/assets/lib/lit-3.1.0-all.js')
		context.libPathsWeb.add('/assets/custom-elements/un-posts-lit.js')
		//const includeSummary = block?.meta?.include?.includes('summary')
		//const includeImage = block?.meta?.include?.includes('image')

		// attributes
		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
			(locale) ? `lang="${locale}"` : '',
			(block.type) ? `type="${block.type}"` : '',
			(block?.ui?.isCollapsible) ? "collapsible" : '', // boolean property
			(block?.ui?.include) ? `ui-parts="${block.ui.include.join(' ')}"` : '',
		].join(' ')

		context.posts.docs ??= []
		const innerHTML = context.posts.docs.filter(post => post.type === block.type).map(post => post.html.main).join(' ')

		let html = /* html */`
			<un-posts-lit ${attributes}>
				<noscript>${innerHTML}</noscript>
			</un-posts-lit>`

		return html
	}

	function renderUnPosts(block = {}) {
		context.libPathsWeb.add('/assets/lib/lit-3.1.0-all.js')
		context.libPathsWeb.add('/assets/custom-elements/un-posts-lit.js')
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
			(block.hover?.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
		].filter(item => item).join(' ')

		let html = /* html */`
			<un-img-gallery ${attributes}>
				${block.images.map((img) => {
					switch (img.link.type) {
						case 'internal':
							return /* html */`<a href="${origin}/${img.link.slug}" slot="gallery">${renderImageset(img.rel, context, { sizes: '50vw', loading: 'eager' })}</a>`;
						case 'custom':
							return /* html */`<a href="${img.link.url}" slot="gallery">${renderImageset(img.rel, context, { sizes: '50vw', loading: 'eager' })}</a>`;
						case 'none':
							return renderImageset(img.rel, context, { sizes: '100vw' }) // 'size: 100vw' as the same img will be used for the modal
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
				${(block.images.map((img) => renderImageset(img, context, { loading: "lazy" }))).join(' ')}
			</un-img-slides>
		`;

		return html
	}

	function renderImg(block = {}) {

		if (block.caption) {
			html = /* html */`
			<figure>
				${renderImageset(block.rel, context)}
				<figcaption>${block.caption}</figcaption>
			</figure>
			`;
		} else {
			html = /* html */`${renderImageset(block.rel, context)}`
		}

		return html
	}

	function renderUnImg(block = {}) {
		/* NOTES:
			- not working with images in RichText content because they're only referenced 
		*/

		if (!block.rel) throw ReferenceError('Error: img.rel is not set')

		const attributes = [
			(block.size) ? `data-size=${block.size}` : '',
			(block.shape) ? `data-shape=${block.shape}` : '',
			(block.filter) ? `data-filter=${block.filter}` : '',
			(block.hover?.length > 0) ? `data-hover=${block.hover.join(' ')}` : '', // array!
			(block.mask) ? `data-mask=${block.mask}` : '',
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		let html = ''
		
		if (['internal', 'custom'].includes(block.link?.type)) {

			let href = ''
			switch (block.link.type) {
				case 'internal':
					const linkedDoc = pages.find(p => p.id === block.link.rel.value)
					const slug = (linkedDoc.isHome) ? `/${locale}/` : `${locale}/${linkedDoc.slug}/`
					href = `${origin}/${slug}`		
					break;
				case 'custom':
					href = `${block.link.url}`
					break;
			}

			html = /* html */`
				<a href="${href}">
					<un-img ${attributes}>${renderImageset(block.rel, context)}</un-img>
				</a>
			`
			
		} else {
			// no link
			if (block.caption) {
				html = /* html */`
				<figure>
					<un-img ${attributes}>${renderImageset(block.rel, context)}</un-img>
					<figcaption>${block.caption}</figcaption>
				</figure>
				`;
			} else {
				html = /* html */`
				<un-img ${attributes}>${renderImageset(block.rel, context)}</un-img>`;
			}
			
		}
		
		return html // returns a string
	}

	/* function renderUnImgBackground(block = {}) {
		const attributes = [
			(theme) ? `data-theme="${theme}"` : '',
			(slug) ? `data-page="${slug}"` : '',
		].filter(item => item).join(' ')

		const html = `
			<un-background><un-background>
		`
	} */

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

		html = /* html */`<un-rt ${attributes}>${renderLexicalHTML(block.contentRichText.root.children, context, locale)}</un-rt>`;

		return html.replace(/\s+/g, " ").trim()
	}

	/* function renderUnST(block = {}) {

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

		let html = `
			<un-st ${attributes}>
				${headingOpen}${block.text}${headingClose}
			</un-st>
		`;

		return html
	} */

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

}