import express from 'express';
import payload from 'payload';
import fs from 'fs'
import https from 'https'
//require('dotenv').config()
import * as dotenv from 'dotenv' 
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

	https.createServer(serverOptions, app).listen(port, async () => {
		console.log(
			`Express is now listening for incoming connections on ${process.env.SERVER_URL}.`
		)
	})
}

start();
