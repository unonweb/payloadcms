import { readdir } from 'fs/promises'
import log from '../customLog'
import { extname } from 'path'

export default async function getFilePathsByKeywords(dir = '', keywords = [], extensions = [], inverse = false) {
	// reads dir and creates array of filepaths matching an array of keywords
	// returns array of filepaths matching the provided keywords
	try {
		let paths = []

		if (!Array.isArray(keywords)) {
			keywords = [keywords]
		}

		const allFiles = await readdir(dir)
		let selectedFiles

		switch (inverse) {
			case false:
				selectedFiles = allFiles.filter(file => {
					if (extensions.length > 0) {
						return (extensions.includes(extname(file))) && keywords.some(key => file.includes(key))
					}
					else {
						return keywords.some(key => file.includes(key))
					}
				})
				break;
			case true:
				selectedFiles = allFiles.filter(file => !keywords.some(key => file.includes(key)))	
				break;	
		}
		
		for (const file of selectedFiles) {
			paths.push(`${dir}/${file}`)
		}

		return paths
		
	} catch (err) {
		log(err.stack, user, __filename, 3)
	}
}