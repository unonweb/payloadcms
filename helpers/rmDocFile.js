// imports
import { promises as fsPromises } from 'fs'
import { existsSync } from 'fs'
import getSiteFieldValue from '../hooks/getSiteFieldValue'
import CustomError from './customError'
import log from './customLog'

export default async function rmDocFile(req, doc, destFieldName = 'pathDataGlobal', fileSlug = 'id') {
	// AFTER CHANGE HOOK
	// runs after a document is created or updated
	// currently only used for removing posts

	if (!doc || !req) throw new CustomError('!doc || !req')

	let type
	if (doc?.globalType) type = 'global'
	if (req?.collection) type = 'collection'

	const colSlug = req.collection.config.slug
	const destDir = await getSiteFieldValue(doc.site, destFieldName, req.user.shortName)

	if (!destDir || !colSlug) {
		throw new CustomError('!destDir || !colSlug', req.user.shortName, __filename)
	}

	let destPaths = []

	if (colSlug === 'images' || colSlug === 'navs' || colSlug === 'headers' || colSlug === 'sites') {
		// no localization
		destPaths.push(`${destDir}/${colSlug}/${doc[fileSlug]}.json`)
	}
	else {
		// with localization
		// posts
		// remove all language variants of this doc
		if (!req.languages.length === 0) {
			throw new CustomError(`!req.languages.length === 0`, req.user.shortName, __filename)
		}
		for (const lang of req.languages) {
			destPaths.push(`${destDir}/${colSlug}/${lang}/${doc[fileSlug]}.json`) // <-- ATT! doc.id !
		}
	}
	// remove locally
	await _removeFiles(destPaths, req.user.shortName)

}

async function _removeFiles(destPaths = [], user = '') {

	for (const path of destPaths) {
		if (existsSync(path)) {
			await fsPromises.rm(path)
			log(`successfully removed: ${path}`, user, __filename, 6)
		} else {
			log(`path does not exist: ${path}; maybe a locale issue`, user, __filename)
		}
	}
}

async function _removeFile(destPath = '') {
	try {
		if (existsSync(destPath)) {
			await fsPromises.rm(destPath);
			console.log('successfully removed: ', destPath);
		} else {
			throw ReferenceError('file does not exist at path: ', destPath)
		}
	} catch (err) {
		console.error(err);
	}
}