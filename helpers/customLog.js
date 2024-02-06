const { basename } = require('path');

// "<0>"  /* system is unusable */
// "<1>"  /* action must be taken immediately */
// "<2>"  /* critical conditions */
// "<3>"  /* error conditions */
// "<4>"  /* warning conditions */
// "<5>"  /* normal but significant condition */
// "<6>"  /* informational */
// "<7>"  /* debug-level messages */

module.exports = function log(msgOrErr = '', user = '', file = '', prio = 6) {

	if (msgOrErr.name === 'CustomError') {
		// log CustomError
		const errStr = `<${msgOrErr.lvl}>[${msgOrErr.user}] [${msgOrErr.file}] ${msgOrErr.stack}`
		console.error(errStr)
	} 
	else if (typeof msgOrErr === 'string') {
		file = basename(file, '.js')
		const msg = `<${prio}>[${user}] [${file}] ${msgOrErr}`
		console.log(msg);
	}
};