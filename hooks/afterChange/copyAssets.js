import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import cpFile from '../../helpers/_cpFile'

export default async function copyAssets(assets = ['images', 'documents'], { req, doc, context }) {
	/*
		Task:
			Copy assets like images from payload upload directory to site's assets directory
	*/
	try {
		const user = context.user
		const mode = context.mode
		const site = context.site
		const collection = req?.collection?.config?.slug

		/* images */
		if (assets.includes('images') && doc?.assets?.imgs?.length > 0) {
			for (const fn of doc.assets.imgs) {
				if (fn === null) {
					log(`filename is null in doc.assets.imgs for "${doc.id}" in "${collection}"`, user, __filename)
					continue
				}
				const srcDir = `${process.cwd()}/upload/images`
				const destDir = `${site.paths.fs.site}/${mode}/assets/imgs`
				const srcPath = `${srcDir}/${fn}`
				const destPath = `${destDir}/${fn}`
				await cpFile(srcPath, destPath, user, { overwrite: false })
			}
		}
		/* documents */
		if (assets.includes('documents') && doc?.assets?.documents?.length > 0) {
			for (const fn of doc.assets.docs) {
				if (fn === null) {
					log(`filename is null in doc.assets.documents for "${doc.id}" in "${collection}"`, user, __filename)
					continue
				}
				const srcDir = `${process.cwd()}/upload/documents`
				const destDir = `${site.paths.fs.site}/${mode}/assets/docs`
				const srcPath = `${srcDir}/${fn}`
				const destPath = `${destDir}/${fn}`
				await cpFile(srcPath, destPath, user, { overwrite: false })
			}
		}
		/* fonts */
		if (assets.includes('fonts') && doc?.assets?.fonts?.length > 0) {
			for (const fn of doc.assets.imgs) {
				if (fn === null) {
					log(`filename is null in doc.assets.fonts for "${doc.id}" in "${collection}"`, user, __filename)
					continue
				}
				const srcDir = `${process.cwd()}/upload/fonts`
				const destDir = `${site.paths.fs.site}/${mode}/assets`
				const srcPath = `${srcDir}/${fn}`
				const destPath = `${destDir}/${fn}`
				await cpFile(srcPath, destPath, user, { overwrite: false })
			}
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err)
	}
}