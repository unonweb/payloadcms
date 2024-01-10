import { spawn } from 'child_process'
import log from '../customLog'
import { cwd as processCwd } from 'process'

export default function spawnCmd(cmd, args = [], user, { shell = false, cwd = processCwd(), timeout = undefined } = {}) {
	const childPS = spawn(cmd, args, {
		shell: shell,
		cwd: cwd
	})

	childPS.on('spawn', () => {
		// is emitted once the child process has spawned successfully. 
		log(`spawn(): "${cmd}"`, user, __filename, 7)
	})
	childPS.on('error', err => {
		log(`stderr: "${err}"`, user, __filename, 4)
	})
	childPS.on('close', (code) => {
		// is emitted after a process has ended and the stdio streams of a child process have been closed. 
		log(`close: child process exited with code ${code}`, user, __filename, 7);
	})
	childPS.stdin.on('data', data => {
		// 'data' event is fired every time data is output from the cmd
		log(`stdin: ${data.toString()}`, user, __filename, 7)
	})
	childPS.stdout.on('data', data => {
		// 'data' event is fired every time data is output from the cmd
		log(`stdout: ${data.toString()}`, user, __filename, 7)
	})
	/* childPS.stderr.on('data', data => {
		// has never output something reasonable....
		log(`stderr: ${data.toString()}`, user, __filename, 4)
	}) */
}