import rmFile from './_rmFile'
import cpFile from './_cpFile'
import { readdir } from 'fs/promises'
import { parse } from 'path'
import log from '../customLog'
import getCustomElementPaths from './_getCustomElementPaths'

export default async function syncFiles(srcDir = '', destDir = '', fileSelection = [], user = '') {

	try {
		
		const destFiles = await readdir(destDir)

		/* copy newer files */
		for (const filename of fileSelection) {
			const srcPath = `${srcDir}/${filename}`
			const destPath = `${destDir}/${filename}`
			await cpFile(srcPath, destPath, user, { overwrite: 'older' })
		}

		/* delete obsolete files */
		if (destFiles.length > 0) {
			const filesToDelete = destFiles.filter(file => !fileSelection.includes(file))  // compare without file extension
	
			for (const file of filesToDelete) {
				rmFile(`${destDir}/${file}`, user)
			}
		}
		
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}