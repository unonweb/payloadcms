export default function renderHTMLElement(element = '', content = '', attributes = {}) {
	
	let attStr = ''
	Object.entries(attributes).forEach(([key, value]) => {
	  attStr += `${key}="${value}" `
	})
	
	return `<${element} ${attStr}>${content}</${element}>`
}