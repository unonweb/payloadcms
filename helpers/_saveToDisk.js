import log from './customLog'
import { existsSync } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

export default async function saveToDisk(path, data, user = '', { ctParentPath = true, flag = 'w' } = {}) {
	// custom wrapper for writeFile

	/* flags:
		'a': Open file for appending. The file is created if it does not exist.
		'ax': Like 'a' but fails if the path exists.
		'a+': Open file for reading and appending. The file is created if it does not exist.
		'ax+': Like 'a+' but fails if the path exists.
		'w': Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
		'wx': Like 'w' but fails if the path exists.
		'w+': Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
		'wx+': Like 'w+' but fails if the path exists. 
	*/

	try {
		if (ctParentPath === true) {
			// create path if not existent:
			if (!existsSync(path)) {
				let destDir = dirname(path)
				await mkdir(destDir, { recursive: true })
				log(`path created: ${path}`, user, __filename, 7)
			}
		}
		await writeFile(path, data, { flag: flag })
		log(`written: ${path}`, user, __filename, 6)
	} catch (err) {
		log(err.stack, user, __filename, 6)
	}
}