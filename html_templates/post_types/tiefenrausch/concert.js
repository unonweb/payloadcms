const renderLexicalHTML = require('/home/payload/cms/src/helpers/renderLexicalHTML.js')
const dateConvertToLocal = require('/home/payload/cms/src/helpers/dateConvertToLocal.js')

module.exports = function renderHTMLTemplate(docID, { data, req, context }) {
	return /* html */`
		<div class="post gig past" id="${docID}">
			<time class="date" datetime="${data.date_start}">${dateConvertToLocal(data.date_start, data.dateStyle, req.locale)}</time>
			<div class="info">
				<span class="location">
					${(data.location_url) 
						? /* html */`<a class="location_url" href="${data.location_url}">${data.location_name}</a>`
						: /* html */`<span class="location_name">${data.location_name}</span>`
					}
				</span> // 
				<span class="support">${data.artists.map(artist => {
					return /* html */`
						${(artist.url) 
							? /* html */`<a class="band" href="${artist.url}">${artist.name}</a>`
							: /* html */`<span class="band">${artist.name}</span>`
						}
					`
				}).join(' ')}
				</span>
			</div>
		</div>
	`
}