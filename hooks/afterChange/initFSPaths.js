import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import canAccess from '../../helpers/_canAccess'
import { mkdir } from 'fs/promises'

export default async function initFSPaths({ req, doc, operation, previousDoc, context }) {
	/*
		Type:
			beforeValidate collection
		Tasks:
			Init FS structure
		Requires:
			doc.paths.fs.site
	*/
	try {
		if (operation === 'create') {

			if (!await canAccess(doc.paths.fs.site)) await mkdir(doc.paths.fs.site)
			// prod
			if (!await canAccess(`${doc.paths.fs.site}/prod/assets/custom-elements`)) await mkdir(`${doc.paths.fs.site}/prod/assets/custom-elements`, { recursive: true })
			if (!await canAccess(`${doc.paths.fs.site}/prod/assets/imgs`)) await mkdir(`${doc.paths.fs.site}/prod/assets/imgs`)
			if (!await canAccess(`${doc.paths.fs.site}/prod/assets/docs`)) await mkdir(`${doc.paths.fs.site}/prod/assets/docs`)
			if (!await canAccess(`${doc.paths.fs.site}/prod/assets/lib`)) await mkdir(`${doc.paths.fs.site}/prod/assets/lib`)
			if (!await canAccess(`${doc.paths.fs.site}/prod/assets/posts`)) await mkdir(`${doc.paths.fs.site}/prod/assets/posts`)
			// dev
			if (!await canAccess(`${doc.paths.fs.site}/dev/assets/custom-elements`)) await mkdir(`${doc.paths.fs.site}/dev/assets/custom-elements`, { recursive: true })
			if (!await canAccess(`${doc.paths.fs.site}/dev/assets/imgs`)) await mkdir(`${doc.paths.fs.site}/dev/assets/imgs`)
			if (!await canAccess(`${doc.paths.fs.site}/dev/assets/docs`)) await mkdir(`${doc.paths.fs.site}/dev/assets/docs`)
			if (!await canAccess(`${doc.paths.fs.site}/dev/assets/lib`)) await mkdir(`${doc.paths.fs.site}/dev/assets/lib`)
			if (!await canAccess(`${doc.paths.fs.site}/dev/assets/posts`)) await mkdir(`${doc.paths.fs.site}/dev/assets/posts`)

		}
	} catch (error) {
		log(error.stack, user, __filename, 3)
		mailError(error)
	}
}