const renderLexicalHTML = require('/home/payload/cms/src/helpers/renderLexicalHTML.js')
const dateConvertToLocal = require('/home/payload/cms/src/helpers/dateConvertToLocal.js')

module.exports = function renderHTMLTemplate(docID, { data, req, context }) {
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
				<time 
					datetime="${data.date_start}" 
					class="date_start">${dateConvertToLocal(data.date_start, data.dateStyle, req.locale)}
				</time>
			</header>
			<section class="content">
				${renderLexicalHTML(data?.richText?.root?.children, context, req.locale)}
			</section>
		</article>`
}