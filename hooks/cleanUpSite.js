import getDoc from './getDoc'
import getCol from './_getCol'
import { parse } from 'path'
import { readdir, rm } from 'fs/promises'
import log from '../customLog'
import canAccess from './_canAccess'
import getAppMode from './_getAppMode'
import isDirectory from './_isDirectory'

export default async function cleanUpSite(site = {}, locales = [], user = '', { cleanUpPages = true, cleanUpFonts = true, cleanUpImgs = true, cleanUpDocs = true, cleanUpCElements = false } = {}) {

	try {

		const mode = getAppMode()
		const pathSite = `${site.paths.fs.site}/${mode}`
		const pathSiteAssets = `${site.paths.fs.site}/${mode}/assets`

		const pages = await getCol('pages', user, {
			depth: 0,
			where: {
				site: { equals: site.id },
			},
		})

		/* get only the element IDs that are used on some page */
		let elementIDs = new Set()
		for (const doc of pages.docs) {
			if (doc.nav) elementIDs.add(doc.nav)
			if (doc.header) elementIDs.add(doc.header)
			if (doc.footer) elementIDs.add(doc.footer)
		}
		elementIDs = Array.from(elementIDs)

		const navs = await getCol('navs', user, {
			depth: 0,
			where: {
				id: { in: elementIDs },
			}
		})
		const headers = await getCol('headers', user, {
			depth: 0,
			where: {
				id: { in: elementIDs },
			}
		})
		const footers = await getCol('footers', user, {
			depth: 0,
			where: {
				id: { in: elementIDs },
			}
		})

		/* get all assets IDs in use from all elements AND the pages themselves  */
		const allElementDocs = [...navs.docs, ...headers.docs, ...footers.docs, ...pages.docs]
		let assetIDs = new Set()
		for (const doc of allElementDocs) {
			if (Array.isArray(doc?.imgs)) {
				for (const assets of doc.imgs) {
					assetIDs.add(assets)	
				}	
			}
			if (Array.isArray(doc?.assets?.imgs)) {
				for (const assets of doc.assets.imgs) {
					assetIDs.add(assets)	
				}	
			}
			if (Array.isArray(doc?.assets?.docs)) {
				for (const assets of doc.assets.docs) {
					assetIDs.add(assets)
				}	
			}
		}

		assetIDs = Array.from(assetIDs)

		if (cleanUpPages === true) {
			const allSlugs = pages.docs.map(doc => doc.slug) // slugs or not localized

			for (const loc of locales) {
				const pathSiteLocale = `${pathSite}/${loc}`
				if (await canAccess(pathSiteLocale) && await isDirectory(pathSiteLocale)) {
					const pageFileObjs = await readdir(pathSiteLocale, { withFileTypes: true, recursive: false })
					for (const file of pageFileObjs) {
						if (file.isDirectory() && !allSlugs.includes(file.name)) {
							await rm(`${file.path}/${file.name}`, { force: false, recursive: true })
							log(`removed: ${file.path}/${file.name}`, user, __filename, 6)
						}
					}
				}
			}
		}

		if (cleanUpImgs === true) {
			const imgDir = `${pathSiteAssets}/imgs`
			// rm all img files that are not on the positive list:
			const imgFiles = (await canAccess(imgDir)) ? await readdir(imgDir) : []
			for (const fn of imgFiles) {
				if (!assetIDs.includes(fn)) {
					const dest = `${imgDir}/${fn}`
					await rm(dest, { force: false, recursive: false })
					log(`removed ${dest}`, user, __filename, 6)
				}
			}
		}

		if (cleanUpDocs === true) {
			// rm all doc files that are not on the positive list:
			const pathDocs = `${pathSiteAssets}/docs`
			const docFiles = (await canAccess(pathDocs)) ? await readdir(pathDocs) : []
			for (const fn of docFiles) {
				if (!assetIDs.includes(fn)) {
					const dest = `${pathDocs}/${fn}`
					await rm(dest, { force: false, recursive: false })
					log(`removed ${dest}`, user, __filename, 6)
				}
			}
		}

		if (cleanUpFonts === true) {
			const pathFonts = `${pathSiteAssets}/fonts`
			const fontsPosList = (site.assets.fonts) ? site.assets.fonts : null
			if (fontsPosList && await canAccess(pathFonts)) {
				// rm all font files that are not on the positive list:
				const fontFiles = await readdir(pathFonts)
				for (const fn of fontFiles) {
					if (fn.endsWith('.woff2') && !fontsPosList.includes(fn)) {
						const dest = `${pathFonts}/${fn}`
						await rm(dest, { force: false, recursive: false })
						log(`removed ${dest}`, user, __filename, 6)
					}
				}
			}
		}

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}