const renderLexicalHTML = require('/home/payload/cms/src/helpers/renderLexicalHTML.js')
const dateConvertToLocal = require('/home/payload/cms/src/helpers/dateConvertToLocal.js')
/* 	
	Problem:
		This file is not transformed by Webpack 
		because it's dynamically imported with the magic comment "webpackIgnore: true".
		I need this comment because otherwise it's transformed and moved into ./dist
		The consequence of this is: 
		"SyntaxError: Cannot use import statement outside a module"

	Solution 1: Convert in into ES6
		If I change the extension to .mjs I get:
		Error: require() of ES Module /home/payload/cms/src/html_templates/post_types/manueldieterich/65b952fc1868a1120233bd95.mjs not supported
		Background: tsc and webpack transform everything into commonjs (in package.json "module" is set to "commonjs")
		If I change tsc target into "es6"
	
	Solution 2: Convert it into CommonJS
		- Requires module.exports (if not I get "SyntaxError: Unexpected token 'export'")

	*/

module.exports = function renderHTMLTemplate(docID, { data, req, context }) {
	/* veröffentlichung */
	return /* html */`
		<article class="post" id="${docID}">
			<header class="meta">
				<span class="title">
					${(data.title)
						? /* html */`<h1 class="title_main">${data.title}</h1>` : ''
					}
					${(data.subtitle)
						? /* html */`<h2 class="title_sub">${data.subtitle}</h2>` : ''
					}
				</span>
				${(data.date_start)
					? /* html */`<time datetime="${data.date_start}" class="date_start">${dateConvertToLocal(data.date_start, data.dateStyle, req.locale)}</time>` : ''
				}
			</header>
			<section class="content">
				${renderLexicalHTML(data?.richText?.root?.children, context)}
			</section>
		</article>`
}