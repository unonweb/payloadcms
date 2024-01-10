import { dirname } from 'path';
import canAccess from './_canAccess';
import { stat, constants, copyFile, mkdir } from 'fs/promises';
import log from '../customLog';

export default async function cpFile(src = '', dest = '', user = '', { overwrite = false, ctParentPath = true } = {}) {
	// fs.constants.COPYFILE_EXCL: The copy operation will fail if dest already exists.
	// fs.constants.COPYFILE_FICLONE: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
	// fs.constants.COPYFILE_FICLONE_FORCE: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.

	try {
		if (ctParentPath === true) {
			const existsDestDir = await canAccess(dirname(dest))
			if (!existsDestDir) {
				// create dest dir if it doesn't exist:
				await mkdir(dirname(dest), { recursive: true })
				log(`destination directory created: ${dirname(dest)}`, user, __filename, 7)
			}
		}

		const existsDest = await canAccess(dest)
		if (!existsDest) {
			await copyFile(src, dest) // if dest doesn't exist just copy
			log(`copied file to: ${dest}`, user, __filename, 7)
		} else {
			// if dest exists, well...
			switch (overwrite) {
				case false:
					await copyFile(src, dest, constants.COPYFILE_EXCL) // don't overwrite
					log(`copied file to: ${dest}`, user, __filename, 7)
					break
				case true:
					await copyFile(src, dest) // overwrite!
					log(`copied file to: ${dest}`, user, __filename, 7)
					break
				case 'modified':
					// overwrite check if src file has been modified
					const statSrc = await stat(src)
					const statDest = await stat(dest)
					if (statSrc.mtimeMs > statDest.mtimeMs) {
						// if modification time of src is smaller
						await copyFile(src, dest) // overwrite!
						log(`copied newer file to ${dest}`, user, __filename, 7)
					} else {
						log(`file has not been changed: ${dest}`, user, __filename, 7)
					}
			}
		}

	} catch (err) {
		switch (err.code) {
			case 'EEXIST':
				// file already exists
				// --> ignore this error
				//log(err.message, user, __filename, 7)
				break
			case 'ENOENT':
				// no such file or directory
				log(err.stack, user, __filename, 4)
				break
			default:
				log(err.stack, user, __filename, 7)
		}
	}
}

async function cpFileExtended(srcPath = '', destPath = '', { user = '', overwrite = true } = {}) {
	// overwrite = true
	// overwrite = 'older'

	try {
		let fileExists = await canAccess(destPath)
		let perform = true
		let msg

		if (fileExists === true && overwrite === false) {
			perform = false
			msg = `file already exists at: ${destPath}`
		}
		else if (fileExists === true && overwrite === 'older') {
			// check if file has been modified
			const statSrc = await stat(srcPath)
			const statDest = await stat(destPath)
			if (!statSrc.mtimeMs > statDest.mtimeMs) {
				perform = true
				msg = `copied newer file to ${destPath}`
			} else {
				perform = false
				msg = `file has not been changed: ${destPath}`
			}
		}

		if (perform === true) {
			// create dest dir if it doesn't exist:
			if (!await canAccess(dirname(destPath))) {
				await mkdir(dirname(destPath), { recursive: true })
				log(`destination directory created: ${dirname(destPath)}`, user, __filename)
			}
			// copy
			await copyFile(srcPath, destPath)
		}

		if (msg) {
			log(msg, user, __filename, 6)
		}

	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}