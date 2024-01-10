import { readdir } from 'fs/promises'
import log from '../customLog'

export default async function getFilenamesByKeywords(dir = '', keywords = []) {

	if (!Array.isArray(keywords)) {
		keywords = [keywords]
	}

	const allFiles = await readdir(dir)
	const selection = allFiles.filter(file => keywords.some(key => file.includes(key)))

	return selection
	/* let cElementPaths = []

	for (const key of keywords) {
		const filenames = filenames.filter(filename => filename.includes(key))
		if (filenames.length === 0) {
			log(`no files found at "${srcDir}" that match "${key}"`, user, __filename, 3)
		} else {
			for (const filename of filenames) {
				cElementPaths.push(`${srcDir}/${filename}`)
			}
		}
	} */
}