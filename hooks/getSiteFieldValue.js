//import findByID from 'payload/dist/collections/operations/findByID'
import payload from 'payload'
import getAppMode from './_getAppMode'
import log from '../customLog'
import CustomError from '../customError'
import reportError from '../reportError'

export default async function getSiteFieldValue(site, field, user = '') {
	// returns the value of field from collection 'sites'
	// depending on mode ('prod' or 'dev')

	// you can get siteID by 
	// const siteID = doc.site

	try {
		
		let siteFieldValue
		const appMode = getAppMode()

		if (!site || !field) {
			throw new CustomError('argument missing!', user, __filename)
		}
		else if (typeof site === 'object') {
			// if site is passed as full obj
			siteFieldValue = site[appMode][field]
		}
		else if (typeof site === 'string') {
			// if site is passed as id string
			siteFieldValue = await getFieldValueFromDoc('sites', site, appMode, field, user)
		}

		if (!siteFieldValue) {
			throw new CustomError('!siteFieldValue', user, __filename)
		}
		
		return siteFieldValue

	} catch (err) {
		reportError(err)
	}
}

async function getFieldValueFromDoc(colSlug, docID, fieldLvlOne, fieldLvlTwo, user = '') {
	// RESTRICCTION:
	// works only with top level fields
	try {
		const result = await payload.findByID({
			collection: colSlug,
			id: docID,
		})

		let extract

		if (fieldLvlTwo) {
			extract = result[fieldLvlOne][fieldLvlTwo]
		} else if (fieldLvlOne) {
			extract = result[fieldLvlOne]
		} else {
			throw new CustomError(`arguments missing: ${fieldLvlOne}`, user, __filename)
		}

		if (!extract) {
			throw new CustomError('extract empty!', user, __filename)
		} else {
			return extract
		}
	} catch (err) {
		reportError(err)
	}
}