export default function getPosSubset(obj, ...keys) {
	// returns an obj with the given properties picked
	return Object.fromEntries(keys.filter(key => key in obj).map(key => [key, obj[key]]));
}