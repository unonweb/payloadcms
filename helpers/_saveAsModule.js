import { promises as fsPromises } from 'fs'

export default async function _saveAsModule(destPath, obj) {
	try {
		let moduleStr = `export default ${JSON.stringify(obj)}`
		destPath += '.js' // add file extension
		await fsPromises.writeFile(destPath, moduleStr)
		console.log('successfully written js module to: ', destPath)
	} catch (err) {
		console.error(err)
	}
}