import log from './customLog'
import renderLexicalHTML from './renderLexicalHTML.js'; // commonjs // works in dev mode
import renderImageset from './renderImageset.js'; // commonjs // works in dev mode
import renderUnHeaderBanner from './renderUnHeaderBanner';
import renderUnFooter from './renderUnFooter';
import renderUnLayFlex from './renderUnLayFlex';
import renderUnPosts from './renderUnPosts';
import renderSVG from './renderSVG';
import renderUnDrawer from './renderUnDrawer';
import renderUnMapLeaflet from './renderUnMapLeaflet';
import renderUnRT from './renderUnRT';
import renderUnContactData from './renderUnContact';
import renderUnNav from './renderUnNav';
import renderLinkInternal from './renderLinkInternal';
import renderLinkExternal from './renderLinkExternal';
import renderUnDropDown from './renderUnDropDown';
import renderUnLangSwitch from './renderUnLangSwitch';
import renderUnImg from './renderUnImg';
import renderUnImgGallery from './renderUnImgGallery';
import renderUnImgSlides from './renderUnImgSlides';
import renderImg from './renderImg';

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

	const site = context.site
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
					case 'columns-flex':
						return renderUnLayFlex(block);

					// --- POSTS ---
					case 'include-posts-flex':
						return renderUnPosts(block);

					// --- OTHER ---
					case 'svg':
						return renderSVG(block);
					case 'drawer':
						return renderUnDrawer(block);
					case 'map-leaflet':
						return renderUnMapLeaflet(block);

					// --- TEXT ---
					case 'rich-text':
						return renderUnRT(block);
					//case 'text':
					//case 'textarea':
						return renderUnST(block)
					case 'contact-data':
						return renderUnContactData(block);

					// --- NAVS ---
					case 'nav':
						return renderUnNav(block);
					//case 'nav-split':
						return renderUnNavSplit(block);
					//case 'menu-aside':
						return renderUnMenuAside(block);
					case 'link-internal':
						return renderLinkInternal(block)
					case 'link-external':
						return renderLinkExternal(block, parentType, context);
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
						return renderUnImgBackground(block);

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
}