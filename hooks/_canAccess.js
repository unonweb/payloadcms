import { access } from 'fs/promises'

export default async function canAccess(path = '') {
	try {
		await access(path) // tests a user's permissions for the file or directory
		return true
	} catch {
		return false
	}
}