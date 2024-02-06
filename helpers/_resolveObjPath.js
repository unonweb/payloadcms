export default function resolveObjPath(obj, path) {
	/* 
		Tasks:
			Resolves the path to a nested property given by a string
			Returns the value of that nested property
		Example:
			resolveObjPath(obj, 'nested.id')
	*/
	return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
    }, obj || self)
}