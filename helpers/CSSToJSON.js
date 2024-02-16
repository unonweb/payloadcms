function CSSToJSON(css = '') {

	if (typeof css !== 'string') {
		throw new Error("Need a CSS string but given ", typeof css, css);
	}

	function _trimSemiColon(text) {
        return text.slice(-1) === ';' ? text.slice(0, this.length - 1) : text;
    };

	let output = {}
	let lastKey
	let term
	let style

	try {
		css.split("{").forEach(item => {
			term = item.trim();
			if (term) {
				if (term.indexOf("}") === -1) {
					output[term] = {}; //it's a selector
					lastKey = term;
				} else { 
					// contains styles and next selector
					term.substring(0, term.indexOf("}")).split(";").forEach(keyValue => {
						style = keyValue.split(":");
						if (style && style.length === 2) {
							output[lastKey][style[0].trim().replace(/^\"|\"$/g, '')] = _trimSemiColon(style[1].trim().replace(/^\"|\"$/g, '')); //for new style
						}
					});
					try { 
						// may be End of Styles
						lastKey = term.split("}")[1].trim();
						if (lastKey) {
							output[lastKey] = {}; //for new selector
						}
					} catch (e) {
						//no more selectors for our life
					}
				}
			}
		});
	} catch (e) {
		return "Not a valid CSS..!";
	}
	
	return output;
}