export default function hash(str, max = 1000) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash = hash & hash;
	}
	return Math.round(max * Math.abs(hash) / 2147483648);
}