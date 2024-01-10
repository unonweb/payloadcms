export default function resolveObjPath(obj, path) {
	return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
    }, obj || self)
}