import express from 'express';
import payload from 'payload';
import fs, { readSync } from 'fs'
import https from 'https'
import { exec, execSync } from 'child_process'
//require('dotenv').config()
import * as dotenv from 'dotenv'
import renderDeployPage from './html_templates/render-deploy-page';
import log from './helpers/customLog';
import mailError from './helpers/mailError';

dotenv.config()
const app = express();
const port = (process.env.NODE_ENV === 'development') ? 3000 : 3000

// Redirect root to Admin panel
app.get('/', (_, res) => {
	res.redirect('/admin');
});

const serverOptions = {
	key: fs.readFileSync(process.env.SSL_KEY_FILE),
	cert: fs.readFileSync(process.env.SSL_CERT_FILE),
};

// Initialize Payload
const start = async () => {

	await payload.init({
		secret: process.env.PAYLOAD_SECRET,
		express: app,
		email: {
			fromName: 'payload',
			fromAddress: 'support@unonweb.de',
			//mailTransporter,
			transportOptions: {
				host: process.env.SMTP_HOST,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS
				},
				port: 465,
				secure: true, // use TLS
				tls: {
					// do not fail on invalid certs
					rejectUnauthorized: false
				}
			},
		},
	})

	/* route: deploy-site */
	const routerDeploy = express.Router()
	routerDeploy.use(payload.authenticate)
	routerDeploy.use(async (req, res, next) => {
		try {
			if (req.user) {
				const siteID = req.query.site
				const site = await req.payload.findByID({ collection: 'sites', id: siteID, depth: 0 })
				//const branch = req.query.branch
				//const cmd = `un-deploy-site.sh ${site.domainShort} --${branch}`
				const cmd = `/home/payload/bash_scripts/un-deploy-site.sh ${site.domainShort}`
				//let result = execSync(cmd, { encoding: 'utf8', shell: '/bin/sh', })
				//let html = renderDeployPage(site)
				//res.set('Content-Type', 'text/html') 
				//res.send(html)
				res.redirect(`https://${site.domain}`)
				exec(cmd, (error, stdout, stderr) => {
					// this callback is called when process terminates
					if (error) {
					  log(`exec error: ${error}`, req.user.shortName, __filename)
					  return
					}
					if (stderr) {
						log(`exec stderr: ${stderr}`, req.user.shortName, __filename)
					}
					log(`exec stdout: ${stdout}`, req.user.shortName, __filename)
				})
				//log(result, req.user.shortName, __filename, 6)
				//result = result.split('\n')
			}
			else {
				next()
			}	
		} catch (error) {
			log(error, '', __filename, 3)
			mailError(error)
		}
		
	})

	app.use('/deploy-site', routerDeploy)

	https.createServer(serverOptions, app).listen(port, async () => {
		console.log(
			`Express is now listening for incoming connections on ${process.env.SERVER_URL}.`
		)
	})
}

start();
