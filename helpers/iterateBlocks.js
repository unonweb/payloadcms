const log = require('./customLog.js');
const renderUnHeaderBanner = require('./renderUnHeaderBanner.js');
const renderUnFooter = require('./renderUnFooter.js');
const renderUnLayFlex = require('./renderUnLayFlex.js');
const renderUnPosts = require('./renderUnPosts.js');
const renderSVG = require('./renderSVG.js');
const renderUnDrawer = require('./renderUnDrawer.js');
const renderUnMapLeaflet = require('./renderUnMapLeaflet.js');
const renderUnRT = require('./renderUnRT.js');
const renderUnContactData = require('./renderUnContact.js');
const renderUnNav = require('./renderUnNav.js');
const renderLinkInternal = require('./renderLinkInternal.js');
const renderLinkExternal = require('./renderLinkExternal.js');
const renderUnDropDown = require('./renderUnDropDown.js');
const renderUnLangSwitch = require('./renderUnLangSwitch.js');
const renderUnImg = require('./renderUnImg.js');
const renderUnImgGallery = require('./renderUnImgGallery.js');
const renderUnImgSlides = require('./renderUnImgSlides.js');
const renderImg = require('./renderImg.js');
const renderSection = require('./renderSection.js');

module.exports = function iterateBlocks(blocks = [], meta = {}, context = {}) {
	/*
		Tasks:
			- Iterate and switch through blocks
			- Call html render function for each block
			- Populate context
		Arguments:
			- blocks
			- context
			- context.posts
			- context.pages
			- context.user
			- meta.theme
			- meta.slug
			- meta.locale
	*/
	try {
		if (!Array.isArray(blocks)) {
			blocks = [blocks];
		}
		let html = blocks.map((block) => {

			log(`render "${block.blockType}"`, context.user, __filename, 6)

			switch (block.blockType) {

				// --- HEADER ---
				case 'header-banner':
					return renderUnHeaderBanner(block, meta, context);

				// --- FOOTER ---
				case 'footer-default':
					return renderUnFooter(block, meta, context);

				// --- LAYOUT ---
				case 'columns-flex':
					return renderUnLayFlex(block, meta, context);
				case 'section':
					return renderSection(block, meta, context);

				// --- POSTS ---
				case 'include-posts-flex':
					context.libPathsWeb.add('/assets/custom-elements/un-posts-lit.js')
					return renderUnPosts(block, meta, context);

				// --- OTHER ---
				case 'svg':
					return renderSVG(block, meta, context);
				//case 'drawer':
					//return renderUnDrawer(block, meta, context);
				case 'map-leaflet':
					context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.css')
					context.libPathsWeb.add('/assets/lib/leaflet-1.9.4.js')
					context.libPathsWeb.add('/assets/custom-elements/un-map-leaflet.js')
					return renderUnMapLeaflet(block, meta, context);

				// --- TEXT ---
				case 'rich-text':
					return renderUnRT(block, meta, context);
				//case 'text':
				//case 'textarea':
					//return renderUnST(block)
				//case 'contact-data':
					//return renderUnContactData(block, theme, slug);

				// --- NAVS ---
				case 'nav':
					return renderUnNav(block, meta, context);
				//case 'nav-split':
					//return renderUnNavSplit(block);
				//case 'menu-aside':
					//return renderUnMenuAside(block, theme, slug);
				case 'link-internal':
					return renderLinkInternal(block, meta, context)
				case 'link-external':
					return renderLinkExternal(block, meta, context);
				case 'menu-drop-down':
					return renderUnDropDown(block, meta, context);
				case 'lang-switch':
					return renderUnLangSwitch(block, meta, context);

				// --- IMAGE ---
				case 'un-img':
					return renderImg(block, meta, context);
					return renderUnImg(block, meta, context);
				case 'img':
					return renderImg(block, meta, context);
				case 'img-slides':
					return renderUnImgSlides(block, meta, context);
				case 'img-gallery':
					return renderUnImgGallery(block, meta, context);
					//case 'img-background':
					//return renderUnImgBackground(block, meta, context);

				// --- DEFAULT ---
				default:
					log(`blockType unknown: ${block.blockType}`, context.site.domainShort, __filename, 3);
			}
		})

		html = html.join(' ').replace(/\s+/g, " ").trim()

		return html

	} catch (err) {
		log(err.stack, context.user, __filename, 3);
	}
}