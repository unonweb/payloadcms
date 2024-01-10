import log from '../customLog'

export default function areObjEqual(a, b, ignoreKeys = [], user = '', { logDiff = true, method = 'isDeepEqual' } = {}) {
	// * order doesn't matter

	let diffKey = ''
	let areEqual

	try {
		switch (method) {
			case 'everyKey':
				areEqual = everyKey(a, b)
				break
			case 'sortAndStringify':
				areEqual = sortAndStringify(a, b)
				break
			case 'isDeepEqual':
				areEqual = isDeepEqual(a, b)
			break
			
		}

		if (!areEqual && logDiff && diffKey) {
			log(`objects differ in "${diffKey}"`, user, __filename, 7)
		}

		return areEqual

		function everyKey(a, b) {
			// doesn't work as expected

			if (a !== null && typeof a === 'object' && Object.keys(a).length > 0) {
				return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => {
					//console.log(`test key "${key}"`)
					if (ignoreKeys.includes(key)) {
						return true
					} else {
						if (everyKey(a[key], b[key], ignoreKeys) === true) {
							return true
						} else {
							diffKey = key
							return false
						}
					}
				})
			} else {
				return a === b
			}
		}

		function sortAndStringify(a, b) {
			// doesn't work recursively
			// only works on flat objects
			
			// Object.entries(a) returns the [key, value] pairs as array
			// sorts the elements of an array in place
			let aMod = Object.entries(a).filter(([key]) => !ignoreKeys.includes(key)).sort()
			let bMod = Object.entries(b).filter(([key]) => !ignoreKeys.includes(key)).sort()
			return JSON.stringify(aMod) == JSON.stringify(bMod)
		}

		function isDeepEqual(a, b) {

			const aKeys = Object.keys(a).filter(key => !ignoreKeys.includes(key))
			const bKeys = Object.keys(b).filter(key => !ignoreKeys.includes(key))

			if (aKeys.length !== bKeys.length) return false;

			for (var key of aKeys) {
				const aValue = a[key];
				const bValue = b[key];

				const isObjects = isObject(aValue) && isObject(bValue);

				if ((isObjects && !isDeepEqual(aValue, bValue)) || (!isObjects && aValue !== bValue)) {
					return false;
				}
			}

			return true;
		};

		function isObject(object) {
			return object != null && typeof object === "object";
		};

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}