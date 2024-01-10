import { stat as fsStat } from 'fs/promises'
import log from '../customLog'

export default async function isDirectory(path = '') {
	try {
		const stat = await fsStat(path) // 
		return stat.isDirectory()
	} catch(error) {
		log(error.stack, '', __filename, 4)
		return false
	}
}