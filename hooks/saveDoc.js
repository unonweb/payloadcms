// imports
import CustomError from '../customError'
import saveAsJson from './_saveAsJson'

export default async function saveDoc(req, doc, { destDir = '', colSlug = '', user = '', fileSlug = 'id', localization = false } = {}) {
	// AFTER CHANGE HOOK
	// runs after a document is created or updated
	// for 'pages' collection we use the more specific hook 'savePage'
	// called by 'Posts'

	user ??= req?.user?.shortName
	colSlug ??= req?.collection?.config?.slug
	let destPath

	if (!doc || !req || !destDir || !colSlug) {
		throw new CustomError('!doc || !req || !destDir || !colSlug', user, __filename)
	}

	if (localization === false) {
		// no localization
		destPath = `${destDir}/${colSlug}/${doc[fileSlug]}.json` // --> /home/frida/code/web/projects/sites/11ty/rjuschka/_src/_data/payload/posts/de/hello.json
	}
	else {
		// with localization
		// posts
		const locale = req.locale ?? 'de' // <-- ATT!
		destPath = `${destDir}/${colSlug}/${locale}/${doc[fileSlug]}.json` // --> /home/frida/code/web/projects/sites/11ty/rjuschka/_src/_data/payload/posts/de/hello.json
		doc.locale = locale // add locale
	}
	
	// save locally
	await saveAsJson(destPath, doc, user)

}