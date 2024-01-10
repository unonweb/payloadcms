import log from '../customLog'
import { existsSync } from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'

export default async function saveAsJson(destPath, data, user = '') {
	
	if (typeof data === 'object') {
		data = JSON.stringify(data) // convert json if not passed as a string
	}
	// add file extension if not given:
	if (path.extname(destPath) === '') {
		destPath += '.json'
	}
	// create path if not existent:
	if (!existsSync(destPath)) {
		let destDir = path.dirname(destPath)
		await fsPromises.mkdir(destDir, { recursive: true })
		//log(`path created: ${destPath}`, user, __filename, 6)
	}
	await fsPromises.writeFile(destPath, data)
	log(`written: ${destPath}`, user, __filename, 6)
}