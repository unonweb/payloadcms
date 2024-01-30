import renderLexicalHTML from './renderLexicalHTML'
import getDoc from '../hooks/getDoc'
import getPosSubset from './getPosSubset'
import log from '../customLog'

export default async function renderPostHTML({ data, originalDoc, req, context }) {

	try {
		const docID = data?.id ?? originalDoc.id
		const postType = await getDoc('post-types', data.type, context.user, { depth: 0 })
	
		let contentFields = getPosSubset(data, ...data.shape)
		
		// date
		const dateStyle = setDateOptions(postType.dateStyle)
		contentFields.date_start = (contentFields.date_start) 
			? new Date(contentFields.date_start).toLocaleString(req.locale, dateStyle) 
			: undefined
		
		// richText
		contentFields.richText = renderLexicalHTML(data?.richText?.root?.children, context)
		contentFields.id = docID
		
		// update 
		data.html.main =  render(postType.html, contentFields).replace(/\s+/g, " ").trim()	

		return data

	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}

function setDateOptions(dateStyle) {
	// date options
	if (dateStyle === 'year') {
		return { year: 'numeric' }
	}
	else {
		return { dateStyle: dateStyle }
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