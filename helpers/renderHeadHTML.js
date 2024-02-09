import log from './customLog'
import canAccess from './_canAccess';
import getAppMode from './_getAppMode'
import { readFile, readdir } from 'fs/promises'
import getRelatedDoc from '../hooks/getRelatedDoc';

export default async function renderHeadHTML(data, context) {
	/*
		Task:
			Render <head>
			[dev]
				- Add all js and css files from assets/custom-elements
			[prod]
				- Add custom-elements.js
				- Add custom-elements.css
		Requires:
			- data.assets.head: 
		Should be called at least when one of the following changes:
			- mode
			- page.description
			- page.title
	*/
	try {
		const mode = context.mode
		const site = context.site
		const user = context.user
		const fsPathSite = `${site.paths.fs.site}/${mode}`
		const fsPathAssets = `${fsPathSite}/assets`
		const fsPathCElements = `${fsPathSite}/assets/custom-elements`

		/* data.assets.head */
		const pathsLibFilesCSS = (data.assets.head?.length > 0) ? data.assets.head.filter(fn => fn.endsWith('.css')) : []
		const pathsLibFilesJS = (data.assets.head?.length > 0) ? data.assets.head.filter(fn => fn.endsWith('.js')) : []

		/* hrefLang */
		let hrefLangHTML = ''
		if (site.locales.used.length > 1) {
			// --- extract allURLs
			let allURLs = []
			for (const page of context.pages.docs) {
				for (const url of Object.values(page.url)) {
					allURLs.push(url)
				}
			}
			const altLocaleURLs = getAltLocaleURLs(data.url, allURLs)
			const origin = getOrigin(mode, site)
			hrefLangHTML = ctHrefLangLinks(data.url, altLocaleURLs, origin)
		}

		/* background image */
		const backgroundImg = (site.background?.img) ? await getRelatedDoc('images', site.background.img, context.user, { depth: 0 }) : null

		const headHTML = /* html */`
			<head>
				<title>${site.brandName ?? site.domainShort} | ${data.title}</title>
				<meta charset="utf-8">
				${data.description ? /* html */`<meta name="description" content="${data.description}"/>` : ''}
				<meta name="author" content="Udo Nonner" />
				<meta name="copyright" content="Udo Nonner" />
				<meta name="robots" content="index,follow" />
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<link rel="canonical" href="https://${site.domain}${data.url}"/>
				${hrefLangHTML}
				${(backgroundImg) ? /* html */`<link rel="preload" as="image" href="/assets/imgs/${backgroundImg.filename}">` : ''}
				
				<!--- ALWAYS --->
				${insertAssetsAlways(pathsLibFilesCSS)}
				${(mode === 'prod') ? await insertAssetsProd(fsPathSite, pathsLibFilesJS) : ''}
				${(mode === 'dev') ? await insertAssetsDev(fsPathSite) : ''}

			</head>`

		return headHTML.replace(/\s+/g, " ").trim()

	} catch (err) {
		log(err.stack, context.user, __filename, 3)
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
		case 'lem':
			if (mode === 'dev') return site.paths.web.origin.dev
			if (mode === 'prod') return site.paths.web.origin.prod
			break
		case 'strato':
			return `https://${site.domain}`
		default:
			return `https://${site.domain}`
	}
}

function insertTagScriptByPath(paths = []) {
	/* 
		Return: HTML-String
	*/
	if (!Array.isArray(paths)) paths = [paths]
	if (paths.length === 0) return ''

	return paths.map(path => /* html */`<script type="module" src="${path}"></script>`).join(' ')
}

function insertTagScriptByName(names = [], dir = '', { module = true } = {}) {
	/* 
		Return: HTML-String
	*/
	if (!Array.isArray(names)) names = [names]
	if (names.length === 0) return ''

	return names.map(fn => /* html */`<script ${module ? 'type="module"' : ''} src="${dir}/${fn}"></script>`).join(' ')
}

function insertTagStyleLinkByName(names = [], dir = '') {
	/* 
		Return: HTML-String
	*/
	if (!Array.isArray(names)) names = [names]
	if (names.length === 0) return ''

	return names.map(fn => /* html */`<link rel="stylesheet" type="text/css" href="${dir}/${fn}">`).join(' ')
}

function insertTagStyleLinkByPath(paths = []) {
	/* 
		Return: HTML-String
	*/
	if (!Array.isArray(paths)) paths = [paths]
	if (paths.length === 0) return ''

	return paths.map(path => /* html */`<link rel="stylesheet" type="text/css" href="${path}">`).join(' ')
}

async function insertAssetsProd(fsPathSite = '', pathsLibFilesJS = []) {

	const fsPathCElements = `${fsPathSite}/assets/custom-elements`
	const fsPathAssets = `${fsPathSite}/assets`

	// check local fs asset paths
	if (!await canAccess(`${fsPathCElements}/bundle-celements.js`)) log(`Cant't access "${fsPathCElements}/bundle-celements.js"`, user, __filename, 3)
	if (!await canAccess(`${fsPathCElements}/bundle-celements.css`)) log(`Cant't access "${fsPathCElements}/bundle-celements.css"`, user, __filename, 3)
	if (!await canAccess(`${fsPathAssets}/site.css`)) log(`Cant't access "${fsPathAssets}/site.css"`, user, __filename, 3)

	const html = /* html */`
		<!--- PROD ASSETS --->
		<link href="/assets/site.css" rel="stylesheet" type="text/css">
		<style>${await readFile(`${fsPathSite}/assets/user.css`, 'utf-8')}</style>
		<style>${await readFile(`${fsPathSite}/assets/fonts.css`, 'utf-8')}</style>
		<script src="/assets/custom-elements/bundle-celements.js" type="module"></script>
		<link href="/assets/custom-elements/bundle-celements.css" rel="stylesheet" type="text/css">
		${insertTagScriptByPath(pathsLibFilesJS)}
	`
	// inline "user.css" (will not be cached)
	// inline "font.css" (will not be cached)
	// link 'bundle.js' 
	// link 'bundle.css'

	return html ?? ''
}

async function insertAssetsDev(fsPathSite) {

	const fsPathCElements = `${fsPathSite}/assets/custom-elements`
	const dirContent = await readdir(fsPathCElements, { recursive: false, withFileTypes: false }) // readdir cElements
	const cElementFilesJS = dirContent.filter(fn => fn.endsWith('.js') && fn.startsWith('un-'))
	const cElementFilesCSS = dirContent.filter(fn => fn.endsWith('.css') && fn.startsWith('un-')) // includes all themes/domains

	const html = /* html */`
	
		<!--- DEV ASSETS --->
		<link rel="stylesheet" type="text/css" href="/assets/site.css">
		<link rel="stylesheet" type="text/css" href="/assets/user.css">
		<link rel="stylesheet" type="text/css" href="/assets/fonts.css">
		${insertTagScriptByName(cElementFilesJS, '/assets/custom-elements')}
		${insertTagStyleLinkByName(cElementFilesCSS, '/assets/custom-elements')}
	`

	return html ?? ''
}

function insertAssetsAlways(pathsLibFilesCSS) {
	/* 
		Always add separately and only on this specific page because we don't want to have this in the bundle
		- /assets/lib/leaflet-1.9.4.css
	*/
	const html = /* html */`${insertTagStyleLinkByPath(pathsLibFilesCSS)}`

	return html ?? ''
}