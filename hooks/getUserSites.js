import payload from 'payload'
import log from '../helpers/customLog'

export default async function getUserSites(sites = [], user = '', { depth = 0, locale = '' } = {}) {
	// * returns [ { site }, { site }]
	try {
		let query = {
			or: []
		}
	
		for (let siteID of sites) { 
			query.or.push({
				id: { equals: siteID } // <-- ATT! needs to be an id string
			})
		}
	
		const result = await payload.find({
			collection: 'sites',
			depth: depth,
			where: query,
			locale: locale
		})

		return result.docs

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}