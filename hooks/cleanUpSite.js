import getDoc from './getDoc'
import getCol from './getCol'
import { parse } from 'path'
import { readdir, rm } from 'fs/promises'
import log from '../helpers/customLog'
import canAccess from '../helpers/_canAccess'
import getAppMode from '../helpers/_getAppMode'
import isDirectory from '../helpers/_isDirectory'

export default async function cleanUpSite(site = {}, user = '', {
	cleanUpPages = true,
	cleanUpFonts = true,
	cleanUpImgs = true,
	cleanUpDocs = true,
	cleanUpPosts = true,
	cleanUpLocales = true,
	cleanUpCElements = false } = {}) {

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

		const posts = await getCol('posts-flex', user, {
			depth: 0,
			where: {
				site: { equals: site.id },
			},
		})

		/* page element IDs*/
		// get the IDs that are used on any page
		let elementIDs = new Set()
		for (const doc of pages.docs) {
			if (doc.nav) elementIDs.add(doc.nav)
			if (doc.header) elementIDs.add(doc.header)
			if (doc.footer) elementIDs.add(doc.footer)
		}
		// get the element IDs that are used on any post
		for (const post of posts.docs) {
			if (post.nav) elementIDs.add(post.nav)
			if (post.header) elementIDs.add(post.header)
			if (post.footer) elementIDs.add(post.footer)
		}
		elementIDs = Array.from(elementIDs)

		// get corresponding elements
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

		/* assets */
		// get all assets IDs in use from 1) all elements 2) the pages 3) the site collection
		const allDocs = [...navs.docs, ...headers.docs, ...footers.docs, ...pages.docs, ...posts.docs, site]
		let assetIDs = new Set()
		for (const doc of allDocs) {
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

		/* cleanUpPages */
		if (cleanUpPages === true) {
			// remove page files
			const pageSlugs = pages.docs.map(doc => doc.slug) // slugs or not localized

			for (const loc of site.locales.used) {
				
				const pathSiteLocale = `${pathSite}/${loc}`

				/* cleanUpLocales */
				if (!site.locales.used.includes(loc) && cleanUpLocales === true) {
					await rm(pathSiteLocale, { force: false, recursive: true }) // remove the entire locale directory
					log(`removed: ${pathSiteLocale}`, user, __filename, 6)
				} 
				else if (await canAccess(pathSiteLocale) && await isDirectory(pathSiteLocale)) {

					const fileObjs = await readdir(pathSiteLocale, { withFileTypes: true, recursive: false })

					for (const file of fileObjs) {
						if (file.isDirectory() && !pageSlugs.includes(file.name)) {
							await rm(`${file.path}/${file.name}`, { force: false, recursive: true })
							log(`removed: ${file.path}/${file.name}`, user, __filename, 6)
						}
					}
				}
			}
		}

		/* cleanUpPosts */
		if (cleanUpPosts === true) {
			// remove post files
			const allIDs = posts.docs.map(doc => doc.id) // get all post IDs

			const pathPosts = `${pathSite}/posts`

			if (await canAccess(pathPosts) && await isDirectory(pathPosts)) {

				const fileObjs = await readdir(pathPosts, { withFileTypes: true, recursive: false })

				for (const file of fileObjs) {
					if (file.isDirectory() && !allIDs.includes(file.name)) {
						await rm(`${file.path}/${file.name}`, { force: false, recursive: true })
						log(`removed: ${file.path}/${file.name}`, user, __filename, 6)
					}
				}
			}
		}

		/* cleanUpImgs */
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

		/* cleanUpDocs */
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

		/* cleanUpFonts */
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