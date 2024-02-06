import log from './customLog'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'

export default async function rmFiles(destPaths = [], user = '') {
	
	destPaths = (typeof destPaths === 'string') ? [destPaths] : destPaths

	for (const path of destPaths) {
		if (existsSync(path)) {
			await rm(path)
			log(`removed: ${path}`, user, __filename, 6)
		} else {
			log(`path does not exist: ${path}`, user, __filename, 4)
		}
	}
}