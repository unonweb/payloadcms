async ({ operation, originalDoc, previousDoc, data, previousValue, value, context, req, field }) => {
	/*
		Task:
			Update site.urls
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
		if (!req.user) return
		if (req?.query?.where?.id?.in?.length > 0) return // bulk op
		//if (data.url === originalDoc.url) return // no change of value
		
		context.site.urls[originalDoc.id] ??= {}
		if (context.site.urls[originalDoc.id][req.locale] !== originalDoc.url) {
			context.site.urls[originalDoc.id][req.locale] = originalDoc.url
			
			requestUpdateByID(context, {
				src: 'pages',
				dest: 'sites',
				id: context.site.id,
				data: {
					urls: context.site.urls
				},
				reason: 'page.url has changed'
			})
		}
		
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}