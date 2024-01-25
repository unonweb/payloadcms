export default function updateCSSObj(css = {}, selector = '', key = '', val = '') {

	if (typeof css === 'undefined') {
		css = {}
	}
	if (typeof css === 'string') {
		css = JSON.parse(css)
	}

	if (css.hasOwnProperty(selector)) {
		css[selector][key] = val // css[selector][key] already exist - overwrite
	}
	else {
		// create new selector with that key: value
		css[selector] = {
			[key]: val
		}
	}

	return css
}