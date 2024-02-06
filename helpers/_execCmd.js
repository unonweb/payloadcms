//import { promisify } from 'util';
//import { exec } from 'child_process';
//const execPromisified = promisify(exec)

const util = require("util");
const exec = util.promisify(require("child_process").exec);

import log from './customLog';

export default async function execCmd(cmd = '', user, {
	cwd = process.cwd(),
	env = process.env,
	encoding = 'utf8',
	shell = '/bin/sh',
	timeout = 0,
	maxBuffer = 1024 * 1024 } = {}) {

	log(`exec() "${cmd}"`, user, __filename, 7)

	const { error, stdout, stderr } = await exec(cmd);

	if (error) {
		log(`${error}`, user, __filename, 7)
		return;
	}
	if (stderr) {
		log(`${stderr}`, user, __filename, 7)
		return;
	}

	log(`External Program's output:\n ${stdout}`, user, __filename, 7)
}