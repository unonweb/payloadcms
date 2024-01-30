import {
	IS_BOLD,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	IS_CODE,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
} from './_lexicalNodeFormat';

import renderImageset from './renderImageset';

export default function renderLexicalHTML(children, context) {
	/* 
		Requires:
			- context.docFiles
			- context.images
			- context.documents
			- context.pages
	*/

	const images = context.images.docs
	const documents = context.documents.docs
	const pages = context.pages.docs
	const user = context.user
	const pathWebDocs = context.pathWebDocs
	const pathWebImgs = context.pathWebImgs

	if (children === undefined) {
		return
	}
	if (!Array.isArray(children)) {
		children = children.children
	}

	const htmlArray = children.map((node) => {

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
		const innerHTML = (node.children) ? renderLexicalHTML(node.children, context) : null;

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
						let linkedDoc = {}
						switch (node.fields.doc.relationTo) {
							// link -> pages
							case 'pages':
								linkedDoc = pages.find(page => (typeof node.fields.doc.value === 'string') 
									? page.id === node.fields.doc.value 
									: page.id === node.fields.doc.value.id
								)
								href = linkedDoc.url
								break;
							// link -> posts
							case 'posts':
								// const linkedDoc = await getDoc('posts', node.fields.doc.value, user, { depth: 0, locale: locale }) <-- FIX!
								log('Link to posts in rich-text not implemented yet', user, __filename, 5)
								break;
							// link -> documents
							case 'documents':
								linkedDoc = documents.find(doc => (typeof node.fields.doc.value === 'string') 
									? doc.id === node.fields.doc.value 
									: doc.id === node.fields.doc.value.id
								)
								if (linkedDoc?.filename) {
									context.docFiles.push(linkedDoc.filename)
									href = `${pathWebDocs}/${linkedDoc.filename}`
								}
								break
							// link -> images
							case 'images':
								linkedDoc = images.find(img => (typeof node.fields.doc.value === 'string') 
									? img.id === node.fields.doc.value
									: img.id === node.fields.doc.value.id
								)
								if (linkedDoc?.filename) {
									imgFiles.push(linkedDoc.filename)
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
				return /* html */`<un-img data-float="left">${renderImageset(node.value.id, context)}</un-img>` // <-- ATT: hard-coded value
			
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

	return htmlArray.join('') // no space!
}