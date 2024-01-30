async ({ operation, originalDoc, previousDoc, data, previousValue, value, context, req, field }) => {
	/*
		Attention:
			In bulk operation previousDoc doesn't refere to previous version of the same doc
			but to the previous doc in the bulk!
			(value === previousValue) is always true
		Arguments:
			- current: originalDoc.url
			- previous: data.url
	*/
	try {
		// update site.urls
		if (!req.user) return // return in bulk ops (we've disableBulkEdit)

		const hasChanged = (operation === 'update' && data[field.name] !== originalDoc[field.name]) ? true : false // works only with top-lvl fields! // works only in single ops
		if (operation === 'create' || hasChanged === true) {

			context.site.urls[originalDoc.id] ??= {}
			context.site.urls[originalDoc.id][req.locale] = originalDoc.url

			await updateDocSingle('sites', context.site.id, context.user, {
				data: {
					urls: context.site.urls,
				},
				context: {
					isUpdatedByCode: true,
					updatedBy: 'pages',
					...context,
				}
			})
		}
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}