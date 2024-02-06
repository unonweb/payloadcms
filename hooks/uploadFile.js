//import create from 'payload/dist/collections/operations/create'
import payload from 'payload'
import CustomError from '../helpers/customError'
import log from '../helpers/customLog'

export default async function uploadFile(filePath = '', user = '', { data = {}, colSlug = 'images', locale = '' } = {}) {
	// the created doc is returned

	const doc = await payload.create({
		collection: colSlug,
		data: data,
		locale: locale,
		filePath: filePath, // absolute file path
		overrideAccess: true, // Skip access control. By default, this property is set to true within all Local API operations
		showHiddenFields: false, // Opt-in to receiving hidden fields. By default, they are hidden from returned documents in accordance to your config
	})

	if (doc.id) {
		let title = doc.title ?? doc.slug ?? doc.name ?? doc.shortName
		if (typeof title === 'object') {
			title = title[Object.keys(title)[0]] // select first property of title object
		}

		log(`Uploaded "${title}" in "${colSlug}" from: ${filePath}`, user, __filename, 6)

		return doc

	} else {
		throw new CustomError(`could not upload img from "${filePath}"`, user, __filename)
	}
}