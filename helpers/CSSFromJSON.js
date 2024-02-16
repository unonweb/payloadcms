export default function CSSFromJSON(json = {}) {
	/* 
		Task:
			Convert a CSS-JSON into a CSS-String
			Returns tje CSS-String 
	*/
	
	if (typeof json === 'string') {
		json = JSON.parse(json)
	}

	let css = ''

	for (let selector in json) {
		if (json.hasOwnProperty(selector)) {
			css += selector + ' {\n';
			for (let style in json[selector]) {
				if (json[selector].hasOwnProperty(style)) {
					css += style + ': ' + json[selector][style] + ';\n';
				}
			}
			css += '}\n';
		}
	}

	return css
}