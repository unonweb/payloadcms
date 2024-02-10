import log from './customLog.js'
import { stat } from 'fs/promises'

export default async function renderPostHTML({ data, originalDoc, req, context, operation }) {
	/* 
		Type:
			beforeChange collection hook
		Attention:
			During creation 'id' is not yet set
	*/

	try {
		if (operation === 'create') return // it's required to save once in the admin panel just to initialize data.shape from post-types
		if (!data.type) throw Error(`data.type is ${data.type}`)

		const docID = data?.id ?? originalDoc?.id ?? undefined
		const typeID = (data && typeof data.type === 'string') ? data.type : (data && typeof data.type === 'object') ? data.type.id : (originalDoc.type) ? originalDoc.type : null
		const pathTemplateFctn = `/home/payload/cms/src/html_templates/post_types/${context.site.domainShort}/${data.typeName.toLowerCase()}.js`
		/* get template rendering function */
		global.un ??= {}
		global.un.templates ??= {}
		const { mtimeMs } = await stat(pathTemplateFctn)

		if (!global.un.templates[typeID]?.mtimeMs) {
			// not in global obj
			log(`init template render function...`, context.user, __filename, 5)
			global.un.templates[typeID] = {}
			global.un.templates[typeID].mtimeMs = mtimeMs // init mtime
			// require module
			const renderHTMLTemplate = require(/* webpackIgnore: true */pathTemplateFctn); // import template fctn
			global.un.templates[typeID].fctn = renderHTMLTemplate // assign template func
		} 
		else if (mtimeMs > global.un.templates[typeID].mtimeMs) {
			// we've got it in global obj
			// file is newer
			log(`reload template render function...`, context.user, __filename, 5)
			global.un.templates[typeID].mtimeMs = mtimeMs // assign new mtime
			// require module
			if (require.cache[pathTemplateFctn]) delete require.cache[pathTemplateFctn]; // delete cached module
			const renderHTMLTemplate = await require(/* webpackIgnore: true */pathTemplateFctn); // import new template fctn
			global.un.templates[typeID].fctn = renderHTMLTemplate // assign new template func
		}
		
		/* render template to html */
		let html = await global.un.templates[typeID].fctn(docID, { data, req, context })
		/* update html */
		data.html.main = html.replace(/\s+/g, " ").trim()

		return data

	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}



function render(str, obj) {
	return str.replace(/\$\{(.+?)\}/g, (match, p1) => {
		return Prop(obj, p1)
	})
}

function Prop(obj, is, value) {
	if (typeof is == 'string')
		is = is.split('.');
	if (is.length == 1 && value !== undefined)
		return obj[is[0]] = value;
	else if (is.length == 0)
		return obj;
	else {
		var prop = is.shift();
		//Forge a path of nested objects if there is a value to set
		if (value !== undefined && obj[prop] == undefined) obj[prop] = {}
		return Prop(obj[prop], is, value);
	}
}