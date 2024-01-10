import { existsSync } from 'fs'
import { promises as fsPromises } from 'fs'
import cpFile from './_cpFile'

export default async function copyImgToWeb(req = {}, doc = {}, operation = '', pathWebAssets = '', pathPayloadMedia = '') {
	// afterChange hook
	// called by Media collection

	const user = req.user.shortName

	if (operation === 'create') {
		// extract args
		const orgFileName = req?.files?.file?.name
		// get filenames of all img variants
		let filenames = await fsPromises.readdir(pathPayloadMedia)
		filenames = filenames.filter(name => {
			return name.includes(orgFileName.split('.')[0]) // split off file ext
			// FIX: turn it into a more robust solution (what if filename contains a dot?)
		})
		for (const name of filenames) {
			// copy all size variants of the img with the given filename
			cpFile(`${pathPayloadMedia}/${name}`, `${pathWebAssets}/${name}`, user, { overwrite: false })
		}
	}
	else if (operation === 'update') {
		// check if this file exists in the user's img dir
		if (!existsSync(`${pathWebAssets}/${doc.filename}`)) {
			// get all filenames
			let filenames = []
			filenames.push(doc.filename)
			for (const size in doc.sizes) {
				filenames.push(doc.sizes[size].filename)
			}
			log(`The following files were missing in the user's img dir and will be copied now: ${filenames}`, user, __filename)
			for (const name of filenames) {
				// copy all size variants of the img with the given filename
				cpFile(`${pathPayloadMedia}/${name}`, `${pathWebAssets}/${name}`, user, { overwrite: false })
			}
		}
	}
}