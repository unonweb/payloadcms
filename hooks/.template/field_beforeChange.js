/* 
previousValue and previousSiblingDoc args added to beforeChange field hooks
When updating a document you might may want to access the current value in the database for the field value inside of a beforeChange hook. 
This is difficult to do on deeply nested fields using only originalDoc. These two new args make it much more simple.
*/
async ({ data, value, previousValue, req, operation, context, field, collection }) => {
	/* 
		Task:
			
		Arguments:
			- 'value' has the current field value in bulk ops
			- 'value' seems to have the current field value in LocalAPI ops
			- 'data[field.name]' has the value given in the admin panel even though it's reset
	*/
	try {
		if (!req.user) return
		
	} catch (error) {
		log(error.stack, context.user, __filename, 3)
	}
}