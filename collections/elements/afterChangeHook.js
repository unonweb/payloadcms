import payload from 'payload'
import cpAssets from '../../hooks/_cpAssets'
import getAppMode from '../../hooks/_getAppMode'
import getRelatedDoc from '../../hooks/getRelatedDoc'
import log from '../../customLog'
import mailError from '../../mailError'

export default async function afterChangeHook(col = '', { req, doc, previousDoc, operation, context }) {
	try {
		const user = req?.user?.shortName ?? 'internal'
		const host = process.env.HOST
		context.site ??= await getRelatedDoc('sites', doc.site, user)
		context.updatedBy = `${col}` // currently not used
		context.updatedByPageElement = true
		const site = context.site
		const mode = getAppMode()
		const colSingular = (col[col.length - 1] === 's') ? col.slice(0, col.length - 1) : null
		if (!colSingular) log(`Can't create singular version of ${col}`, user, __filename, 5)

		log('--- afterChange ---', user, __filename, 7)

		/* cp assets */
		await cpAssets(`${process.cwd()}/upload/images/`, `${site.paths.fs.site}/${mode}/assets/imgs`, doc.assets.imgs, user) // cp imgs from src to dest

		/* init other locales of this collection */
		if (operation === 'create') {
			if (site.locales.used.length > 1 && site.locales.initOthers === true) {
				for (const loc of site.locales.used) {
					if (loc !== req.locale) {
						const updatedDoc = await updateDocSingle(col, doc.id, user, {
							data: doc,
							locale: loc,
							context: context
						})
					}
				}
			}
		}

		/* update pages */
		if (host === 'lem' || doc.html !== previousDoc.html) {
			//  || doc?.imgs?.toSorted()?.toString() !== previousDoc?.imgs?.toSorted()?.toString()
			if (operation === 'update') {
				// doesn't make sense during creating as it can't be referenced by a page at this point
				for (const loc of site.locales.used) {
					const result = await payload.update({
						collection: 'pages',
						where: {
							and: [
								{ site: { equals: doc.site } },
								{ [colSingular]: { equals: doc.id } },
							]
						},
						data: {
							updatedBy: `${col}-${Date.now()}`
						},
						locale: loc,
						context: context,
					})

					for (const doc of result.docs) {
						log(`updated "${doc.slug}"`, user, __filename, 7)	
					}
			
					for (const error of result.errors) {
						throw new Error(`${error.message} (while updating "${error.id}")`)
					}

					if (result.docs.length === 0) {
						log(`no doc found with "${colSingular}=${doc.id}"`, user, __filename, 5)
					}
				}
			}
		}
	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
	}
}

/* await updateDocsMany('pages', user, {
	depth: 0,
	locale: loc,
	where: {
		and: [
			{ site: { equals: doc.site } },
			{ nav: { equals: doc.id } },
		]
	},
	data: {
		html: {
			nav: doc.html
		}
	},
	context: context
}) */