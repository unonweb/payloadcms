import { readdir } from 'fs/promises'
import rmFile from './_rmFile'

export default async function rmFileSelections(destDir = '', posList = [], user = '') {
	// remove obsolete files
	for (const fn of await readdir(destDir)) {
		if (!posList.includes(fn)) {
			await rmFile(`${destDir}/${fn}`, user)
		}
	}
}