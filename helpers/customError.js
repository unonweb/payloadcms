import { basename } from 'path'

// "<0>"  /* system is unusable */
// "<1>"  /* action must be taken immediately */
// "<2>"  /* critical conditions */
// "<3>"  /* error conditions */
// "<4>"  /* warning conditions */
// "<5>"  /* normal but significant condition */
// "<6>"  /* informational */
// "<7>"  /* debug-level messages */


//this.fileStr = (this.file) ? `[${this.file}]` : ''
//this.userStr = (user) ? `[${user}] ` : ''
//this.createMessage()

export default class CustomError extends Error {

	app = 'payload'
	name = 'CustomError'

	constructor(msg = '', user = '', filePath = '', lvl = 3, sendMail = false) {
		
		super(msg) // adds columnNumber, lineNumber, stack

		this.user = user
		this.file = basename(filePath, '.js')
		this.lvl = lvl
		//this.message = `<${lvl}>[${this.user}][${this.file}] ${msg}` // <lvl> is going to be removed by journald
		this.message = msg
		
		// mail
		this.sendMail = sendMail
		if (lvl <= 4) {
			// sendMail if lvl = warning or worse
			this.sendMail = true
		}
		
		/* this.mail = {
			from: 'unonweb@posteo.de',
			to: 'unonweb@posteo.de',
			subject: `[${this.app}-${lvl}] ${this.file}`,
			text: `${msg}\n${this.stack}\n${this.lineNumber}`
		} */
	}
}