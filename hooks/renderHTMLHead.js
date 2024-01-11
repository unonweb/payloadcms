import { execFile } from 'child_process';
import log from '../customLog'
import execCmd from './_execCmd';
import canAccess from './_canAccess'
import getAppMode from './_getAppMode'
import { readFile } from 'fs/promises'
import { readdir } from 'fs/promises';
import cpFile from './_cpFile';

export default async function renderHTMLHead(page = {}, site = {}, user = '') {
	// renders a <head> corresponding to the given page

	// should be called when one of the following changes:
	// * mode
	// * page.description
	// * page.title

	try {
		// const altLocaleURLs = getAltLocaleURLs(doc.url, allURLs) // needed to render 'hreflang' link tags in layoutHead

		const mode = getAppMode()
		const webPathAssets = '/assets'
		const webPathCElements = `${webPathAssets}/custom-elements`
		const fsPathSite = `${site.paths.fs.site}/${mode}`
		const fsPathAssets = `${fsPathSite}/assets`
		const fsPathCElements = `${fsPathSite}/assets/custom-elements`

		/* dev */
		
		let cElementFilesJS = []
		let cElementFilesCSS = []
		if (mode === 'dev') {
			const dirContent = await readdir(fsPathCElements, { recursive: false, withFileTypes: false })
			cElementFilesJS = dirContent.filter(fn => fn.endsWith('.js') && fn.startsWith('un-'))
			cElementFilesCSS = dirContent.filter(fn => fn.endsWith('.css') && fn.startsWith('un-')) // includes all themes/domains
		}

		/* prod */

		// lib & separate c-element files
		const pathsLibFilesJS = page.assets.head.filter(fn => fn.endsWith('.js'))
		const pathsLibFilesCSS = page.assets.head.filter(fn => fn.endsWith('.css')) // for 'prod' they're included in bundle.css; for 'dev' they're added to head together with all others

		/* // fonts.css
		if (!await canAccess(`${fsPathAssets}/fonts.css`)) {
			saveToDisk(`${fsPathAssets}/fonts.css`, site.frontend.fonts.css, user)
		}
		// user.css
		if (!await canAccess(`${fsPathAssets}/user.css`)) {
			let userCSS = convertJSONToCSS(site.frontend.css)
			await saveToDisk(`${fsPathAssets}/user.css`, userCSS, user)
		}
		// site.css
		if (!await canAccess(`${fsPathAssets}/site.css`)) {
			if (await canAccess(`${site.paths.fs.site}/dev/assets/site.css`)) {
				await cpFile(`${site.paths.fs.site}/dev/assets/site.css`, `${fsPathAssets}/site.css`, user) // cp site.css from dev
			}
		} */
		
		const headHTML = /* html */`
			<head>
				<title>${site.brandName ?? site.domainShort} | ${page.title}</title>
				<meta charset="utf-8">
				${page.description ? /* html */`<meta name="description" content="${page.description}"/>` : ''}
				<meta name="author" content="Udo Nonner" />
				<meta name="copyright" content="Udo Nonner" />
				<meta name="robots" content="index,follow" />
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="apple-mobile-web-app-capable" content="yes" />

				<!--- ALWAYS --->
				${(pathsLibFilesCSS.length > 0)
					// '/assets/lib/leaflet-1.9.4.css'
					// need to include separately for dev mode, too
					? pathsLibFilesCSS.map(path => `<link rel="stylesheet" type="text/css" href="${path}">`).join(' ')
					: ''
				}

				${(mode === 'prod' && pathsLibFilesJS.length > 0)
					// in dev mode the js deps are included from 'https://resources.unonweb.local/custom-elements/prod/'
					? pathsLibFilesJS.map(path => /* html */`<script type="module" src="${path}"></script>`).join(' ')
					: ''
				}
				${(mode === 'prod')
					? /* html */`
							<!--- PROD ASSETS --->
							<link href="${webPathAssets}/site.css" rel="stylesheet" type="text/css">
							<style>${await readFile(`${fsPathAssets}/user.css`, 'utf-8')}</style>
							<style>${await readFile(`${fsPathAssets}/fonts.css`, 'utf-8')}</style>
							<script src=${`${webPathCElements}/bundle-celements.js`} type="module"></script>
							<link href="${`${webPathCElements}/bundle-celements.css`}" rel="stylesheet" type="text/css">`
							// inline "user.css" (will not be cached)
							// inline "font.css" (will not be cached)
							// link 'bundle.js' 
							// link 'bundle.css'
					: ''
				}

				${(mode === 'dev')
					? /* html */`
							<!--- DEV ASSETS --->
							<link rel="stylesheet" type="text/css" href="${webPathAssets}/site.css">
							<link rel="stylesheet" type="text/css" href="${webPathAssets}/user.css">
							<link rel="stylesheet" type="text/css" href="${webPathAssets}/fonts.css">` // link
					: ''
				}
					
				${(mode === 'dev') 
					? cElementFilesCSS.map(fn => /* html */`<link rel="stylesheet" type="text/css" href="${webPathCElements}/${fn}">`).join(' ') 
					: ''
				}
				${(mode === 'dev') 
					? cElementFilesJS.map(fn => /* html */`<script ${module ? 'type="module"' : ''} src="${webPathCElements}/${fn}"></script>`).join(' ')
					: ''
				}

			</head>`

		return headHTML.replace(/\s+/g, " ").trim()

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}

function ctHrefLangLinkTags(pageURL = '', altLocaleURLs = [], site = {}) {

	if (pageURL === '/' || altLocaleURLs.length === 0) {
		return ''
	}

	let origin = site[process.env.BUILDMODE].origin
	/* switch (process.env.BUILDMODE) {
		case 'prod':
			origin = site.originProd
			break
		case 'dev':
			origin = site.originDev
			break
		default:
			log(`unknown value: ${process.env.BUILDMODE}`, site.domainShort, __filename)
	} */
	let hreflangTags = []
	let currentPageLang = pageURL.match(new RegExp('/(de|en)/'))[1] // <-- ATT: hard-coded!
	// extracts lang from url
	// [ "/de/", "de" ] or [ "/en/", "en" ]
	// second item is capturing group

	altLocaleURLs.forEach(otherHref => {
		let otherLang = otherHref.match(new RegExp('/(de|en)/'))[1] // <-- ATT: hard-coded!
		hreflangTags.push(`<link rel="alternate" href="${origin}${pageURL}" hreflang="${currentPageLang}"/>`) // the current locale
		hreflangTags.push(`<link rel="alternate" href="${origin}${otherHref}" hreflang="${otherLang}"/>`) // the alternate locale

	})

	return hreflangTags.join('\n') // returns an empty string if array is empty
}

function getAltLocaleURLs(pageURL = '', otherURLs = []) {
	// get all URLs for that page that only differ in the language code
	return otherURLs.filter(otherHref => (otherHref !== pageURL && otherHref.replace(/\/(de|en|es)\//, '') === pageURL.replace(/\/(de|en|es)\//, ''))) // <-- ATT: hard-coded locales
}