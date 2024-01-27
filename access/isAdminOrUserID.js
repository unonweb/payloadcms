import log from '../customLog'

export default function isAdminOrUserID(userID = []) {
	/* 
		Tasks:
			Return true if the current user is a) admin or b) within the given set of user IDs
	*/
	return function ({ req: { user } }) {
		try {
			if (user) {
				if (user.roles?.includes('admin')) {
					return true
				}
				if (userID && !Array.isArray(userID)) {
					userID = [userID]
				}
				if (userID.includes(user.id)) {
					return true
				} else {
					//log(`[access] requesting collection "${collection?.config?.slug}" user not allowed.`, user.shortName, __filename, 3)
					return false
				}
			} else {
				return false
			}
		} catch (err) {
			log(err.stack, user?.shortName, __filename, 3)
		}
	}
}