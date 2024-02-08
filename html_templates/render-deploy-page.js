import log from '../helpers/customLog'

export default function renderDeployPage(site) {
	// should be called when one of the following changes:
	// * locale
	// * page.title
	// * page.html.main
	// * page.showTitleOnPage
	try {
		const pageHTML = /* html */`
			<!DOCTYPE html>
			<html>
			<head>
				<title>${site.domainShort}</title>
				<meta charset="utf-8">
				<meta name="author" content="Udo Nonner" />
				<meta name="copyright" content="Udo Nonner" />
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
			<body>
				<h1>In wenigen Augenblicken wird die aktualisierte Website hier veröffentlicht: </h1>
				<a class="" href="${site.domain}">${site.domain}</a>
			</body>`

		return pageHTML.replace(/\s+/g, " ").trim()

	} catch (error) {
		log(error.stack, user, __filename, 3)
	}
}