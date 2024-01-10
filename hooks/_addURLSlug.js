import slugify from './_slugify'
import log from '../customLog'

export default function addURLSlug(fieldValue = '', title, isHome = false, useCustomSlug = false, user = '') {
	// field hook
	// field: 'slug'
	// hook: beforeValidate

	try {

		let titleKey
		let slug

		if (isHome === true) {
			// no slug as this is homepage
			slug = ''
		}
		else if (useCustomSlug === true && fieldValue) {
			// use custom slug
			slug = `${slugify(fieldValue)}`
		}
		else if (title) {
			if (typeof title === 'object' && Object.keys(title).length === 1) {
				// 'title' is a (locale) object and this objects has only one key
				titleKey = Object.keys(title)[0]
				slug = `${slugify(title[titleKey])}`
			} else {
				// title is a string 
				slug = `${slugify(title)}`
			}
		}
		else {
			// return nothing
			// important for bulk operations 
			return
		}

		return slug

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}

}