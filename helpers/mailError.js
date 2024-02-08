import getAppMode from './_getAppMode.js'
import payload from 'payload'

export default function mailError(err = {}) {
	// error log
	// error mail report
	//if (getAppMode() === 'dev') return

	const sendEmail = payload?.sendEmail

	if (err.name === 'CustomError') {
		// handle custom error
		sendEmail({
			from: 'unonweb@posteo.de',
			to: 'unonweb@posteo.de',
			subject: `[${err.app}-${err.lvl}] ${err.file}`,
			text: `${err.stack}`
		})	
	} 
	else {
		// handle builtin error
		sendEmail({
			from: 'unonweb@posteo.de',
			to: 'unonweb@posteo.de',
			subject: '[payload-0] builtin',
			text: `${err.stack}`
		})
	}
}