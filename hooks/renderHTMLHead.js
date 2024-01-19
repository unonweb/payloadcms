import log from '../customLog'
import canAccess from './_canAccess';
import getAppMode from './_getAppMode'
import { readFile } from 'fs/promises'
import { readdir } from 'fs/promises';

export default async function renderHTMLHead(page = {}, site = {}, user = '') {
	// renders a <head> corresponding to the given page

	// should be called when one of the following changes:
	// * mode
	// * page.description
	// * page.title

	try {
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
			const dirContent = await readdir(fsPathCElements, { recursive: false, withFileTypes: false }) // readdir cElements
			cElementFilesJS = dirContent.filter(fn => fn.endsWith('.js') && fn.startsWith('un-'))
			cElementFilesCSS = dirContent.filter(fn => fn.endsWith('.css') && fn.startsWith('un-')) // includes all themes/domains
		}

		/* prod */
		// lib & separate c-element files
		const pathsLibFilesJS = (page.assets.head?.length > 0) ? page.assets.head.filter(fn => fn.endsWith('.js')) : []
		const pathsLibFilesCSS = (page.assets.head?.length > 0) ? page.assets.head.filter(fn => fn.endsWith('.css')) : [] // for 'prod' they're included in bundle.css; for 'dev' they're added to head together with all others
		if (mode === 'prod') {
			if (!await canAccess(`${webPathCElements}/bundle-celements.js`)) log(`Cant't access "${fsPathCElements}/bundle-celements.js"`, user, __filename, 3)
			if (!await canAccess(`${webPathCElements}/bundle-celements.css`)) log(`Cant't access "${fsPathCElements}/bundle-celements.css"`, user, __filename, 3)
			if (!await canAccess(`${fsPathAssets}/site.css`)) log(`Cant't access "${fsPathAssets}/site.css"`, user, __filename, 3)
		}

		/* hrefLang */
		let hrefLangHTML = ''
		if (site.locales.used.length > 1) {
			// --- extract allURLs
			let allURLs = []
			Object.values(site.urls).map(item => Object.values(item).forEach(item => allURLs.push(item)))
			const altLocaleURLs = getAltLocaleURLs(page.url, allURLs)
			const origin = getOrigin(mode, site)
			hrefLangHTML = ctHrefLangLinks(page.url, altLocaleURLs, origin)	
		}

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
				<link rel="canonical" href="https://${site.domain}${page.url}"/>
				${hrefLangHTML}
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

function ctHrefLangLinks(pageURL = '', otherURLs = [], origin = '') {

	if (pageURL === '/' || otherURLs.length === 0) {
		return ''
	}

	let hreflangLinks = []
	let currentPageLang = pageURL.match(new RegExp('/(de|en)/'))[1] // <-- ATT: hard-coded!
	// extracts lang from url
	// [ "/de/", "de" ] or [ "/en/", "en" ]
	// second item is capturing group

	otherURLs.forEach(otherHref => {
		let otherLang = otherHref.match(new RegExp('/(de|en)/'))[1] // <-- ATT: hard-coded!
		hreflangLinks.push(/* html */`<link rel="alternate" href="${origin}${pageURL}" hreflang="${currentPageLang}"/>`) // the current locale
		hreflangLinks.push(/* html */`<link rel="alternate" href="${origin}${otherHref}" hreflang="${otherLang}"/>`) // the alternate locale

	})

	return hreflangLinks.join(' ') // returns an empty string if array is empty
}

function getAltLocaleURLs(pageURL = '', allURLs = []) {
	// get all URLs for that page that only differ in the language code
	return allURLs.filter(otherHref => (otherHref !== pageURL && otherHref.replace(/\/(de|en|es)\//, '') === pageURL.replace(/\/(de|en|es)\//, ''))) // <-- ATT: hard-coded locales
}

function getOrigin(mode = '', site = {}) {
	switch (process.env.HOST) {
		case 'frida':
			if (mode === 'dev') return site.paths.web.origin.dev
			if (mode === 'prod') return site.paths.web.origin.prod
			break
		case 'strato':
			return `https://${domain}`
		default:
			return `https://${domain}`
	}
}