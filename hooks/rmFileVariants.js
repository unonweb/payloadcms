import { promises as fsPromises } from 'fs'
import rmFile from './_rmFile';

export default async function rmFileVariants(filename = '', destDir = '') {
	// afterDelete
	const basename = filename.substring(0, filename.lastIndexOf('.'))
	let allFiles = await fsPromises.readdir(destDir)
	allFiles = allFiles.filter(name => {
		return name.includes(basename) // split off file ext
	})
	for (const name of allFiles) {
		rmFile(`${destDir}/${name}`)
	}

}