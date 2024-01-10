function allowAllUsers({ req }) {
	// NOT WORKING AT THE MOMENT
	console.log('[access] allowAllUsers()')
	// allow all authenticated users
	if (user) {
	  return true
	}
}

function allowAll() {
	console.log('[access] allowAll()')
	return true
}

module.exports = {
	allowSpecificUsers,
	allowAllUsers,
	allowAll
}