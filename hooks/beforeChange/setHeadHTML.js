import log from '../../customLog'
import mailError from '../../mailError'
import renderHeadHTML from '../../helpers/renderHeadHTML'

export default async function setHeadHTML({ data, req, context }) {
	/* 
		Tasks:
			- set data.html.head
		Return: 
			data
	*/
	try {

		if (data.hasOwnPage === undefined || data.hasOwnPage === true) {
			data.html.head = await renderHeadHTML(data, context.site, context.user)
		}

		return data

	} catch (err) {
		log(err.stack, user, __filename, 3)
		mailError(err, req)
	}
}