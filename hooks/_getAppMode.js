export default function getAppMode() {
	switch (process.env.NODE_ENV) {
		case 'development':
			//console.log('mode === "dev"')
			return 'dev'
		case 'production':
			//console.log('mode === "prod"')
			return 'prod'
		default:
			throw ReferenceError('"process.env.NODE_ENV" not set')
	}
}