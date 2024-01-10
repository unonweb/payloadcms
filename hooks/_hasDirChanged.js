import { stat, readdir } from 'fs/promises'
import { extname } from 'path'
import log from '../customLog'

export default async function hasDirChanged(pathDir = '', lastModifiedSum = 0, user = '', { ext = ['.js', '.css'], startsWith = '' } = {}) {
	const files = await readdir(pathDir)
	let sumModified = 0

	for (const fn of files) {
		if (ext.includes(extname(fn)) && fn.startsWith(startsWith)) {
			const { mtimeMs } = await stat(`${pathDir}/${fn}`)
			sumModified += mtimeMs	
		}
	}

	if (sumModified !== lastModifiedSum ) {
		log(`has changed: ${pathDir}`, user, __filename, 6)
		return sumModified
	} else {
		return false
	}
}