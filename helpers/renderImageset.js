const log = require('./customLog.js');

module.exports = function renderImageset(img, meta, context, { sizes = '100vw', loading = 'eager', slot = '', classes = '' } = {}) {
	// * requires global images = []

	try {
		// meta
		const slug = meta.slug
		const title = meta.title
		// context
		const images = context.images.docs
		// static
		const pathWebImgs = '/assets/imgs'

		let id

		if (typeof img === 'string') {
			id = img
			img = images.find(item => item.id === id)
		}
		if (typeof img === 'undefined') {
			throw new Error(`Error: could not find img "${id}" for page "${slug}" in images collection`)
		}

		let html

		if (img.sizes) {
			// if there are different sizes...

			let imgSrc = '', imgOrgSrc = '', img1920Src = '', img1600Src = '', img1366Src = '', img1024Src = '', img768Src = '', img640Src = ''

			if (img.filename) {
				context.imgFiles.add(img.filename)
				imgSrc = `${pathWebImgs}/${img.filename}`
				imgOrgSrc = `${pathWebImgs}/${img.filename} ${img.width}w, `
			}
			if (img.sizes.img1920.filename) {
				context.imgFiles.add(img.sizes.img1920.filename)
				img1920Src = `${pathWebImgs}/${img.sizes.img1920.filename} 1920w, `
			}
			if (img.sizes.img1600.filename) {
				context.imgFiles.add(img.sizes.img1600.filename)
				img1600Src = `${pathWebImgs}/${img.sizes.img1600.filename} 1600w, `
			}
			if (img.sizes.img1366.filename) {
				context.imgFiles.add(img.sizes.img1366.filename)
				img1366Src = `${pathWebImgs}/${img.sizes.img1366.filename} 1366w, `
			}
			if (img.sizes.img1024.filename) {
				context.imgFiles.add(img.sizes.img1024.filename)
				img1024Src = `${pathWebImgs}/${img.sizes.img1024.filename} 1024w, `
			}
			if (img.sizes.img768.filename) {
				context.imgFiles.add(img.sizes.img768.filename)
				img768Src = `${pathWebImgs}/${img.sizes.img768.filename} 768w, `
			}
			if (img.sizes.img640.filename) {
				context.imgFiles.add(img.sizes.img640.filename)
				img640Src = `${pathWebImgs}/${img.sizes.img640.filename} 640w, `
			}

			const attributes = [
				(img.alt) ? `alt="${img.alt}"` : '',
				(img.height) ? `height="${img.height}"` : '',
				(img.width) ? `width="${img.width}"` : '',
				(slot) ? `slot="${slot}"` : '',
				(loading) ? `loading="${loading}"` : '',
				(classes) ? `class="${classes}"` : '',
				(slug) ? `id="${slug}-${img.id}"` : `id="${title.toLowerCase()}-${img.id}"` // slug is undefined for posts
			].filter(item => item).join(' ')

			// html
			html = /* html */`
				<img
					src="${imgSrc}"
					srcset="${imgOrgSrc}${img1920Src}${img1600Src}${img1366Src}${img1024Src}${img768Src}${img640Src}"
					sizes="${sizes}"
					${attributes}>`;
					
		} else if (img.filename) {
			// if there is just one size...
			html = /* html */`<img src="${imgSrc}" ${attributes} >`
		} else {
			throw new Erorr(`Error: ${img} does not contain image properties`)
		}

		return html

	} catch (error) {
		log(error.stack, context.user, __filename, 4)
	}
}