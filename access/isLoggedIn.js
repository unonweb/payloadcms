export const isLoggedIn = ({ req }) => {
	// Return true if user is logged in, false if not
	return Boolean(req.user)
}