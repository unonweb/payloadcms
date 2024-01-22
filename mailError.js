import getAppMode from './hooks/_getAppMode'

export default function mailError(err = {}, reqOrPayload = {}) {
	// error log
	// error mail report
	if (getAppMode() === 'dev') return

	const sendEmail = reqOrPayload?.payload?.sendEmail ?? reqOrPayload?.sendEmail

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