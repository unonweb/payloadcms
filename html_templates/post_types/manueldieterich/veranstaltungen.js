const renderLexicalHTML = require('/home/payload/cms/src/helpers/renderLexicalHTML.js')
const dateConvertToLocal = require('/home/payload/cms/src/helpers/dateConvertToLocal.js')

module.exports = function renderHTMLTemplate(docID, { data, req, context }) {
	/* veranstaltung */
	
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
				<span class="date-location">
					<span class="date">
						${(data.date_start)
							? /* html */`<time datetime="${data.date_start}" class="date_start">${dateConvertToLocal(data.date_start, data.dateStyle, req.locale)}</time>` : ''
						}
						${(data.date_end)
							? /* html */`<time datetime="${data.date_end}" class="date_end">- ${dateConvertToLocal(data.date_end, data.dateStyle, req.locale)}</time>` : ''
						} 
					</span>
					<span class="location">
						${(data.location_url) 
							? /* html */`<a class="location_url" href="${data.location_url}">${data.location_name}</a>`
							: /* html */`<span class="location_name">${data.location_name}</span>`
						}
					</span>
				</span>
			</header>
			<section class="content">
				${renderLexicalHTML(data?.richText?.root?.children, context, req.locale)}
			</section>
		</article>`
}