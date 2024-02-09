import log from '../../helpers/customLog'
import mailError from '../../helpers/mailError'
import renderHeadHTML from '../../helpers/renderHeadHTML'

export default async function setHeadHTML({ data, req, context }) {
	/* 
		Tasks:
			- set data.html.head
		Return: 
			- data
		Requires:
			- data.assets.head
	*/
	try {

		if (data.hasOwnPage === undefined || data.hasOwnPage === true) {
			data.html.head = await renderHeadHTML(data, context)
		}

		return data

	} catch (err) {
		log(err.stack, context.user, __filename, 3)
		mailError(err)
	}
}