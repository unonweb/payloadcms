export default function CSSFromJSON(json = {}) {
	// returns a css string
	if (typeof json === 'string') {
		json = JSON.parse(json)
	}

	let output = ''

	for (let selector in json) {
		if (json.hasOwnProperty(selector)) {
			output += selector + ' {\n';
			for (let style in json[selector]) {
				if (json[selector].hasOwnProperty(style)) {
					output += style + ': ' + json[selector][style] + ';\n';
				}
			}
			output += '}\n';
		}
	}

	return output
}