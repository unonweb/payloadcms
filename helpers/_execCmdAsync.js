import { exec } from 'child_process'
import process from 'process'
import log from './customLog'

export default async function execCmdAsync(cmd = '', user, {
	cwd = process.cwd(),
	env = process.env,
	encoding = 'utf8',
	shell = '/bin/sh',
	timeout = 0,
	maxBuffer = 1024 * 1024,
} = {}) {

	try {
		const result = await execPromise()
		log(`exec() ${cmd}`, user, __filename, 7)
		return result

	} catch (error) {
		log(error.stack, user, __filename, 4)
	}

	function execPromise() {
		return new Promise((resolve, reject) => {
			exec(cmd, {
				cwd: cwd,
				env: env,
				encoding: encoding,
				shell: shell,
				timeout: timeout,
				maxBuffer: maxBuffer,
			}, (error, stdout, stderr) => {
				if (error) {
					return reject(error)
				}
				if (stderr) {
					return reject(stderr)
				}
				resolve(stdout)
			})
		})
	}
}

function run(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) return reject(error)
			if (stderr) return reject(stderr)
			resolve(stdout)
		})
	})
}