import { stat } from 'fs/promises'

export default async function isFileNewer(path1, path2) {
	// check if file has been modified
	const stat1 = await stat(path1)
	const stat2 = await stat(path2)

	return !stat1.mtimeMs > stat2.mtimeMs
}