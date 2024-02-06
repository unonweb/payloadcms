import { readFile, writeFile } from 'fs/promises'
import log from './customLog'

export default async function writeBundleFromFilePaths(paths = [], destPath = '', user = '', { minify = true } = {}) {
	try {
		// get contents of all given files
		let content = ''
		for (const path of paths) {
			content += '\n'
			content += await readFile(path, 'utf-8')
		}
		// write the summed content as a new file:
		await writeFile(destPath, content, {
			encoding: 'utf8'
		})

		log(`written "${destPath}"`, user, __filename, 6)

		return destPath

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}