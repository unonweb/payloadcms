// DOM
const DOM_ELEMENT_TYPE = 1;
const DOM_TEXT_TYPE = 3;

// Reconciling
const NO_DIRTY_NODES = 0;
const HAS_DIRTY_NODES = 1;
const FULL_RECONCILE = 2;

// Text node modes
const IS_NORMAL = 0;
const IS_TOKEN = 1;
const IS_SEGMENTED = 2;
// IS_INERT = 3

// Text node formatting
const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
const IS_STRIKETHROUGH = 1 << 2;
const IS_UNDERLINE = 1 << 3;
const IS_CODE = 1 << 4;
const IS_SUBSCRIPT = 1 << 5;
const IS_SUPERSCRIPT = 1 << 6;
const IS_HIGHLIGHT = 1 << 7;

const IS_ALL_FORMATTING =
	IS_BOLD |
	IS_ITALIC |
	IS_STRIKETHROUGH |
	IS_UNDERLINE |
	IS_CODE |
	IS_SUBSCRIPT |
	IS_SUPERSCRIPT |
	IS_HIGHLIGHT;

const IS_DIRECTIONLESS = 1;
const IS_UNMERGEABLE = 1 << 1;

// Element node formatting
const IS_ALIGN_LEFT = 1;
const IS_ALIGN_CENTER = 2;
const IS_ALIGN_RIGHT = 3;
const IS_ALIGN_JUSTIFY = 4;
const IS_ALIGN_START = 5;
const IS_ALIGN_END = 6;

const TEXT_TYPE_TO_FORMAT = {
	bold: IS_BOLD,
	code: IS_CODE,
	italic: IS_ITALIC,
	strikethrough: IS_STRIKETHROUGH,
	subscript: IS_SUBSCRIPT,
	superscript: IS_SUPERSCRIPT,
	underline: IS_UNDERLINE,
}

const log = require('./customLog.js');
const renderImageset = require('./renderImageset.js')

module.exports = function renderLexicalHTML(children, meta, context) {
	/* 
		Requires:
			(for richText internal links)
			- context.images
			- context.documents
			- context.pages
		Updates:
			- context.docFiles
	*/

	try {
		// context
		const images = context.images.docs
		const documents = context.documents.docs
		const pages = context.pages.docs
		const user = context.user
		// meta
		const locale = meta.locale
		// static
		const pathWebDocs = '/assets/docs'
		const pathWebImgs = '/assets/imgs'

		if (children === undefined) {
			return
		}
		if (!Array.isArray(children)) {
			children = children.children
		}

		let html = children.map((node) => {

			// get classes
			let classes = [
				(node.format && typeof node.format === 'string') ? node.format : '',
				(node.format & IS_STRIKETHROUGH) ? 'line-through' : '',
				(node.format & IS_UNDERLINE) ? 'underline' : '',
				(node.indent > 0) ? `indent-${node.indent}` : '',
			].filter(item => item)

			// node.type === text
			if (node.type === 'text') {

				let attributes = [
					(classes.length > 0) ? ` class="${classes.join(' ')}"` : ''
				].filter(item => item).join(' ')

				//let text = `${escapeHTML(node.text)}`;

				let text = `${node.text}`;
				let tag = ''

				// get tag
				if (node.format) {
					if (node.format & IS_BOLD) tag = 'strong'
					//text = `<strong class="${classes}">${text}</strong>`;
					if (node.format & IS_ITALIC) tag = 'em'
					//text = /* html */`<em class="${classes}">${text}</em>`;
					if (node.format & IS_CODE) tag = 'code'
					//text = /* html */`<code class="${classes}">${text}</code>`;
					if (node.format & IS_SUBSCRIPT) tag = 'sub'
					//text = /* html */`<sub class="${classes}">${text}</sub>`;
					if (node.format & IS_SUPERSCRIPT) tag = 'sup'
					//text = /* html */`<sup>${text}</sup>`;
					if (node.format & IS_STRIKETHROUGH || node.format & IS_UNDERLINE) tag = 'span'
				}

				if (tag) {
					return `<${tag}${attributes}>${text}</${tag}>`;
				}
				else {
					return `${text}`;
				}
			}

			// node is null
			if (!node) {
				return null;
			}

			// serialize innerHTML
			const innerHTML = (node.children) ? renderLexicalHTML(node.children, meta, context) : null;

			// serialize outerHTML
			let classStr = ''
			let attributes = []
			switch (node.type) {

				// --- linebreak
				case 'linebreak':
					return /* html */`<br>`

				// --- link
				case 'link':

					let href = ''
					// --- linkType
					switch (node.fields.linkType) {
						case 'custom':
							href = node.fields.url
							break
						case 'internal':
							const linkedDocID = (typeof node.fields.doc.value === 'string') ? node.fields.doc.value : node.fields.doc.value.id
							let linkedDoc
							switch (node.fields.doc.relationTo) {
								// link to pages
								case 'pages':
									linkedDoc = pages.find(page => page.id === linkedDocID)
									href = (typeof linkedDoc.url === 'string') ? linkedDoc.url : linkedDoc.url[locale]
									break;
								// link to posts
								case 'posts-flex':
									// const linkedDoc = await getDoc('posts', node.fields.doc.value, user, { depth: 0, locale: locale }) <-- FIX!
									log('Link to posts in rich-text not implemented yet', user, __filename, 5)
									break;
								// link to documents
								case 'documents':
									linkedDoc = documents.find(doc => doc.id === linkedDocID)
									if (linkedDoc?.filename) {
										context.docFiles.add(linkedDoc.filename)
										href = `${pathWebDocs}/${linkedDoc.filename}`
									}
									break
								// link -> images
								case 'images':
									linkedDoc = images.find(img => img.id === linkedDocID)
									if (linkedDoc?.filename) {
										imgFiles.add(linkedDoc.filename)
										href = `${pathWebImgs}/${linkedDoc.filename}`
									}
									break
							}
					}

					if (!href) throw Error(`href is "${href}"`)

					attributes = [
						`href="${href}"`,
						(node.fields?.isDownload === true) ? `download=""` : '',
						(node.fields.newTab === true) ? 'target="_blank"' : '',
						(node.fields?.rel) ? `rel="${node.fields?.rel}"` : '',
						(classes.length > 0) ? ` class="${classes.join(' ')}"` : ''
					].filter(item => item).join(' ')

					return /* html */`<a ${attributes}>${innerHTML}</a>`

				// --- list
				case 'list': // <-- !IMP: handle properly, especially nested lists
					if (node.listType === 'bullet') {
						return /* html */`<ul>${innerHTML}</ul>`
					} else {
						return /* html */`<ol>${innerHTML}</ol>`
					}

				// --- listitem
				case 'listitem':
					return /* html */`<li>${innerHTML}</li>`

				// --- heading
				case 'heading':
					classStr = (classes.length > 0) ? `class="${classes.join(' ')}"` : ''
					return `<${node.tag} ${classStr}>${innerHTML}</${node.tag}>`

				// --- upload
				case 'upload':
					return /* html */`<un-img data-float="left">${renderImageset(node.value.id, meta, context)}</un-img>` // <-- ATT: hard-coded value

				// --- paragraph
				case 'paragraph':
					classStr = (classes.length > 0) ? `class="${classes.join(' ')}"` : ''
					return /* html */`<p ${classStr}>${innerHTML ? innerHTML : '<br>'}</p>`;

				// --- default
				default:
					// Probably just a normal paragraph
					return /* html */`<p class="${classes}">${innerHTML ? innerHTML : '<br>'}</p>`;
			}
			
		}).filter((node) => node)

		return html.join('') // no space!

	} catch (error) {
		log(error.stack, context.user, __filename, 3)
		//console.log(error.stack)
	}
}

// works in dev mode