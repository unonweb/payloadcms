export default function isUserID({ req }, userID = []) {
	try {
		if (userID && !Array.isArray(userID)) {
			userID = [userID]
		}
		if (!req || !userID.length === 0) {
			throw new ReferenceError('argument missing')
		}
		if (userID.includes(req?.user?.id)) {
			return true
		} else {
			console.log(`[access] requesting collection "${req?.collection?.config?.slug}" user not allowed: "${req?.user?.name}"`)
			return false
		}
	} catch (err) {
		console.error(err)
	}
}