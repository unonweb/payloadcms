import areObjEqual from './_areObjEqual'
import log from '../customLog'

export default function hasChanged(a, b, user = '', { ignoreKeys = [], method = 'isDeepEqual' } = {}) {
	// collection: (doc, previousDoc
	// field: args.originalDoc, args.previousDoc
	let hasChanged
	ignoreKeys.push(...['__v', 'updatedAt', '_id', 'id', 'editingMode'])
	
	if (typeof b === 'undefined') {
		hasChanged === true
		log(`previousDoc is undefined`, '', __filename, 7)
	}
	else {
		hasChanged = !areObjEqual(a, b, ignoreKeys, user, { method: method })
	}
	
	return hasChanged
}