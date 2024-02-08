async ({ data, value, previousValue, req, operation, context, field, collection }) => {
	/* 
		Task:
			Set and retun slug
		Arguments:
			- 'value' has the current field value in bulk operations
			- 'value' seems to have the current field value in local API ops
			- 'data.useCustomSlug' has the value given in the admin panel even though it's reset
	*/
	try {
		if (!req.user) return
		
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}