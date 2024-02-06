import { readdir } from 'fs/promises'
import log from './customLog'

export default async function getCustomElementPaths(srcDir = '', cElementNames = [], user = '') {
	try {
		const srcFiles = await readdir(srcDir)
		let cElementPaths = []

		for (const el of cElementNames) {

			const filenames = srcFiles.filter(filename => filename.includes(el))

			if (filenames.length === 0) {
				log(`no files found at "${srcDir}" that match "${el}"`, user, __filename, 3)
			} else {
				for (const filename of filenames) {
					cElementPaths.push(`${srcDir}/${filename}`)
				}
			}
		}

		return cElementPaths

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}