export default function CSSObjRemoveKey(css = {}, selector = '', key = '') {
	/*	
		Task
			- Remove a key in a CSS-Obj 
			- Return the updated obj
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