import log from './customLog.js'

export default function reportError(err, req, payload) {
	// error log
	// error mail report
	
	if (err.name === 'CustomError') {
		// handle custom error
		log(err)
		if (req) {
			req.payload.sendEmail({
				from: 'unonweb@posteo.de',
				to: 'unonweb@posteo.de',
				subject: `[${err.app}-${err.lvl}] ${err.file}`,
				text: `${err.stack}`
			})
		}
		else if (payload) {
			payload.sendEmail({
				from: 'unonweb@posteo.de',
				to: 'unonweb@posteo.de',
				subject: `[${err.app}-${err.lvl}] ${err.file}`,
				text: `${err.stack}`
			})
		}
		else {
			log('!req || !payload', err.user, __filename)
		}
		
	} 
	else {
		// handle builtin error
		const user = req?.user?.shortName ?? ''
		log(err.stack, user, __filename, 3)
		if (req) {
			req.payload.sendEmail({
				from: 'unonweb@posteo.de',
				to: 'unonweb@posteo.de',
				subject: '[payload-0] builtin',
				text: `${err.stack}`
			})
		}
		else if (payload) {
			payload.sendEmail({
				from: 'unonweb@posteo.de',
				to: 'unonweb@posteo.de',
				subject: '[payload-0] builtin',
				text: `${err.stack}`
			})
		}
	}
}