// imports
import getAppMode from '../helpers/_getAppMode'
import saveAsJson from './_saveAsJson'

export default async function saveSite(req, doc, destFieldName = 'pathDataGlobal', user = '') {
	// AFTER CHANGE HOOK

	const appMode = getAppMode()
	const siteDataDir = doc[appMode][destFieldName] // as this is called by 'sites' collection we already have the data as 'doc

	// set destPath
	const destPath = `${siteDataDir}/site.json`
	// save locally
	await saveAsJson(destPath, doc, user)
}