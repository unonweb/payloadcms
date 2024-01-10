import { readdir } from 'fs/promises';
import { extname } from 'path';

export default async function getCElementFiles(srcDir = '', domainShort = '') {
	/* returns { 
			css: ['fn'], js: ['fn'] 
		} 
	*/

	const srcDirContent = await readdir(srcDir)

	const jsFiles = srcDirContent.filter(fn => {
		if (extname(fn) === '.js') {
			if (fn.startsWith('un-')) {
				return fn
			}	
		}
	})
	
	const cssFiles = srcDirContent.filter(fn => {
		if (extname(fn) === '.css' && fn.startsWith('un-')) {
			// if this is a custom element css file
			if (fn.includes(`--${domainShort}`)) {
				// includes the domain theme
				return fn
			}
			else if (fn.includes('--themes')) {
				// includes the generic themes
				return fn
			}
			else if (!fn.includes('--')) {
				// or no theme at all
				return fn
			}
		}
	})

	return [...jsFiles, ...cssFiles]
}