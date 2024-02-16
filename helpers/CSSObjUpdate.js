export default function CSSObjUpdate(css = {}, selector = '', key = '', val = '') {
	/*	
		Task:
			Update value of CSS-Obj
			Return the updated obj 
		Notes:
			- A CSS-Obj has the shape css[selector][key] = val
	*/

	if (typeof css === 'string') {
		css = JSON.parse(css)
	}

	css ??= {}
	if (!css.hasOwnProperty(selector)) css[selector] = {}
	
	css[selector][key] = val
	
	return css
}