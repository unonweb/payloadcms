import log from '../customLog'
import CustomError from '../customError'
import getAppMode from './_getAppMode'
import getDoc from './getDoc';
import renderLexicalHTML from './renderLexicalHTML';

export default function renderPost(doc, fields = {}, { user = '', locale = '', images = [], site = {}, pages = [], documents = [] } = {}) {
	// called for each page that is to be rendered
	let html
	let libPathsWeb = new Set()
	let imgFiles = []
	let docFiles = []

	const serializedFields = Object.keys(fields).map(fieldName => {

		log(`render(): ${fieldName}`, user, __filename, 7)

		switch (fieldName) {

			// --- HEADER ---
			case 'title':
				return /* html */`<h1>${fields[fieldName]}</h1>`
			case 'richText':
				return /* html */`<h1>${fields[fieldName]}</h1>`

			// --- DEFAULT ---
			default:
				log(`blockType unknown: ${fieldName}`, site.domainShort, __filename, 3);
		}
	})

	return serializedFields
}