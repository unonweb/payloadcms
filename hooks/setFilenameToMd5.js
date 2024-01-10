//import { basename, extname } from 'path'

export default async function setFilenameToMd5(args = {}) {
	// beforeOperation hook
	// modifies and returns 'args'

	const split = args.req.files.file.name.split('.')
	const ext = split[split.length - 1]
	args.req.files.file.orgName = args.req.files.file.name // save original filename

	// set new filename:
	switch (args.req.files.file.mimetype) {
		case 'image/svg+xml':
		case 'application/pdf':
			// .svg and .pdf
			args.req.files.file.name = `${args.req.files.file.md5}.${ext}`
			break;
		default:
			// no file ext required as these files will be resized and named by sharp
			args.req.files.file.name = args.req.files.file.md5
			break;
	}
	
	return args
}