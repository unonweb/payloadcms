import log from '../../customLog'
import mailError from '../../mailError'
import cpFile from '../_cpFile'

export default async function copyAssets(assets = ['images', 'documents'], { req, doc, context }) {
	/*
		Task:
			Copy assets like images from payload upload directory to site's assets directory
	*/
	try {
		const user = context.user
		const mode = context.mode
		const site = context.site

		/* images */
		if (assets.includes('images')) {
			doc.assets.imgs ??= []
			for (const fn of doc.assets.imgs) {
				const srcDir = `${process.cwd()}/upload/images/`
				const destDir = `${site.paths.fs.site}/${mode}/assets/imgs`
				const srcPath = `${srcDir}/${fn}`
				const destPath = `${destDir}/${fn}`
				await cpFile(srcPath, destPath, user, { overwrite: false })
			}
		}
		if (assets.includes('documents')) {
			/* documents */
			doc.assets.docs ??= []
			for (const fn of doc.assets.docs) {
				const srcDir = `${process.cwd()}/upload/documents/`
				const destDir = `${site.paths.fs.site}/${mode}/assets/docs`
				const srcPath = `${srcDir}/${fn}`
				const destPath = `${destDir}/${fn}`
				await cpFile(srcPath, destPath, user, { overwrite: false })
			}
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
	}
}