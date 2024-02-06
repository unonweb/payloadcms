import log from './customLog'

export default function renderPageHTML(locale = '', page = {}, user = '', { navHTML = '', headerHTML = '', footerHTML = '' } = {}) {
	// should be called when one of the following changes:
	// * locale
	// * page.title
	// * page.html.main
	// * page.showTitleOnPage

	try {

		if (navHTML === '') log(`navHTML is empty for "${page.slug}" with locale "${locale}"`, user, __filename, 4)
		if (headerHTML === '') log(`headerHTML is empty for "${page.slug}" with locale "${locale}"`, user, __filename, 4)
		if (!page.html?.main) log(`page.html.main is "${typeof page.html?.main}" for "${page.slug}" with locale "${locale}"`, user, __filename, 4)
		if (!page.html?.head) throw new Error(`page.html.head is "${page?.html?.head}" for "${page.slug}" with locale "${locale}"`)

		const slug = (page.slug === '') ? '/' : page.slug

		const pageHTML = /* html */`
			<!DOCTYPE html>
			<html lang=${ locale } data-theme="">
			${ page.html.head }
			<body>
				${ headerHTML ?? '' }
				${ navHTML ?? '' }
				<main data-page="${slug}" lang="${ locale ?? '' }" data-margin="${ page.main?.margin ?? 'medium'}" data-density="${ page.main?.density ?? 'medium'}" data-justify="${ page.main?.justify ?? 'left'}" data-align="${ page.main?.align ?? 'center'}">
					${ page.html?.main ?? '' }
				</main>
				${ footerHTML ?? '' }
				<div class="deco line" id="line-1" hidden="true" aria-hidden="true"></div>
				<div class="deco line" id="line-2" hidden="true" aria-hidden="true"></div>
				<div class="deco line" id="line-3" hidden="true" aria-hidden="true"></div>
				<div class="deco line" id="line-4" hidden="true" aria-hidden="true"></div>
				<div class="deco line" id="line-5" hidden="true" aria-hidden="true"></div>
				<div class="deco line" id="line-6" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-1" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-2" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-3" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-4" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-5" hidden="true" aria-hidden="true"></div>
				<div class="deco area" id="area-6" hidden="true" aria-hidden="true"></div>
			</body>`

		return pageHTML.replace(/\s+/g, " ").trim()

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}