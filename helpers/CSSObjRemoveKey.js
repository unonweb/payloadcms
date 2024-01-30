export default function CSSObjRemoveKey(css = {}, selector = '', key = '') {
	/*	
		- returns the updated css obj 
	*/

	if (typeof css === 'undefined') {
		css = {}
	}
	if (typeof css === 'string') {
		css = JSON.parse(css)
	}

	if (css.hasOwnProperty(selector)) {
		delete css[selector][key]
	}
	
	return css
}