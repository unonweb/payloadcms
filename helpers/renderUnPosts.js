export default function renderUnPosts(block = {}) {
	/*
		Note:
			un-posts-lit.js is added dynamically and separately to <head> 
			because we want to import the external lit dependeny locally hosted
			This requires us to:
				- Make sure that external lib dep is at <domain>/dev/assets/lib

			If we would include it in the bundle then we need to change the current bundle system:
				1) Check if postsFlex is really (and still) used
				2) Remove/Add un-posts.lit.js to dev/assets/custom-elements
				3) Remove/Add import statement for external dep (needs to at the top of the bundle) 
				4) Remove/Add lit library
	*/
	//context.libPathsWeb.add('/assets/lib/lit-3.1.0-all.js') // external dependency
	context.libPathsWeb.add('/assets/custom-elements/un-posts-lit.js')

	//const includeSummary = block?.meta?.include?.includes('summary')
	//const includeImage = block?.meta?.include?.includes('image')

	// attributes
	const attributes = [
		(theme) ? `data-theme="${theme}"` : '',
		(slug) ? `data-page="${slug}"` : '',
		(locale) ? `lang="${locale}"` : '',
		(block.type) ? `type="${block.type}"` : '',
		(block?.ui?.isCollapsible) ? "collapsible" : '', // boolean property
		(block?.ui?.include) ? `ui-parts="${block.ui.include.join(' ')}"` : '',
	].join(' ')

	context.posts.docs ??= []
	const innerHTML = context.posts.docs.filter(post => post.type === block.type).map(post => post.html.main).join(' ')

	let html = /* html */`
		<un-posts-lit ${attributes}>
			<noscript>${innerHTML}</noscript>
		</un-posts-lit>`

	return html
}