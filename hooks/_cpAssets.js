import cpFile from './_cpFile'

export default async function cpAssets(srcDir = '', destDir = '', assets = [], user = '') {
	for (const fn of assets) {
		const srcPath = `${srcDir}/${fn}`
		const destPath = `${destDir}/${fn}`
		await cpFile(srcPath, destPath, user, { overwrite: false })
	}
}