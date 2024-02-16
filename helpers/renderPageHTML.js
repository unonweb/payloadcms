import log from './customLog'

export default function renderPageHTML(data = {}, locale = '', docID = '', context, { navHTML = '', headerHTML = '', footerHTML = '' } = {}) {
	/*
		Note:
			Should at least be called if one of the following changes:
			- locale
			- page.title
			- page.html.main
			- page.showTitleOnPage
	*/
	try {

		if (navHTML === '') log(`navHTML is empty for "${data.slug}" with locale "${locale}"`, context.user, __filename, 5)
		if (headerHTML === '') log(`headerHTML is empty for "${data.slug}" with locale "${locale}"`, context.user, __filename, 5)
		if (!data.html?.main) log(`page.html.main is "${typeof data.html?.main}" for "${data.slug}" with locale "${locale}"`, context.user, __filename, 5)
		if (!data.html?.head) throw new Error(`page.html.head is "${data?.html?.head}" for "${data.slug}" with locale "${locale}"`)

		const slug = (data.slug === '') ? '/' : data.slug
		const theme = context.site.domainShort

		const pageHTML = /* html */`
			<!DOCTYPE html>
			<html lang=${ locale } data-theme="">
			${ data.html.head }
			<body>
				${ headerHTML ?? '' }
				${ navHTML ?? '' }
				<main data-theme="${theme}" data-page="${docID}" lang="${ locale ?? '' }" data-margin="${ data.main?.margin ?? 'medium'}" data-density="${ data.main?.density ?? 'medium'}" data-justify="${ data.main?.justify ?? 'left'}" data-align="${ data.main?.align ?? 'center'}">
					${ data.html?.main ?? '' }
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
		log(error.stack, context.user, __filename, 3)
	}
}