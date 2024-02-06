import log from './customLog'
import mailError from './mailError'

export default async function requestUpdateByID(context, { src = '', dest = '', id = '', data = {}, reason = '' }) {
	/*
		Task:

		Shape: {
			sites: {
				'36547645623434': {
					urls: ['www.example.com'],
					primaryColor: 'grey',
				}
			}
		}
			
	*/
	try {
		log(`Request update of "${dest}" from "${src}" because "${reason}"`, context.user, __filename, 5)

		if (!dest) throw new Error('!dest')
		if (!id) throw new Error('!id')

		context.requestUpdate ??= {}
		context.requestUpdate[dest] ??= {}
		context.requestUpdate[dest][id] = {
			...context.requestUpdate[dest][id], // existing data
			...data // incoming data
		}
	} catch (error) {
		log(`Request update of "${dest}" from "${src}" because "${reason}"`, context.user, __filename, 3)
		mailError(error)
	}

}