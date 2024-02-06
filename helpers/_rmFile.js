import log from './customLog';
import canAccess from './_canAccess';
import { rm } from 'fs/promises'

export default async function rmFile(destPath = '', user = '', { force = false, recursive = false, throwErrorIfMissing = true } = {}) {
	/* simple wrapper for fsPromises.rm() */
	try {
		if (await canAccess(destPath)) {
			await rm(destPath, { 
				force: force, 
				recursive: recursive
			})
			log(`removed: ${destPath}`, user, __filename, 6)
		} else if (throwErrorIfMissing === true) {
			throw new Error(`file does not exist at path: ${destPath}`)	
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}