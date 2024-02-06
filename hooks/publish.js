import log from '../helpers/customLog'
import { exec } from 'child_process'

export default async function publish(pathSite, user) {
	// publish to netlify
	const deployCmd = `npx netlify deploy --prod --dir _build` // <-- FIX!
	log(`exec() "${deployCmd}"`, user, __filename)

	exec(deployCmd, { cwd: pathSite }, (error, stdout, stderr) => {
		if (error) {
			log(`exec error: ${error}`, user, __filename)
			return
		}
		if (stderr) {
			log(`exec stderr: ${stderr}`, user, __filename)
		}
		log(`exec stdout: ${stdout}`, user, __filename)
	})

	/* updateDocsMany('pages', user, { 
		where: { site: { equals: site.id } },
		data: { _status: 'published' }
	}) */
}