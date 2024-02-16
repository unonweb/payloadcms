//require('dotenv').config()

import { buildConfig } from 'payload/config';
import path from 'path';

import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import Logo from './helpers/logo.js';

/* GLOBALS */
import Admin from './globals/Admin.js';

/* COLLECTIONS */
import { Users } from './collections/Users.js';
import { Sites } from './collections/Sites.js';
import { Images } from './collections/assets/Images.js';
import { Headers } from './collections/elements/Headers.js';
import { Footers } from './collections/elements/Footers.js';
import { Navs } from './collections/elements/Navs.js';
import { Pages } from './collections/Pages.js';
import { Documents } from './collections/assets/Documents.js';
import { Fonts } from './collections/assets/Fonts.js';
import { _FontFamilies } from './collections/assets/_FontFamilies.js';
import { Tags } from './collections/Tags.js';
import { PostsFlex } from './collections/dynamic/PostsFlex.js';
import { PostTypes } from './collections/dynamic/PostTypes.js';
import { PageTemplates } from './collections/PageTemplates.js';

//const mockModulePath = path.resolve(__dirname, 'mocks/emptyObject.js')
//const mockModulePath = '/home/payload/cms/src/mocks/emptyObject.js'
const mockModulePath = path.resolve(__dirname, 'mocks/emptyObject.js')
const execCmdPath = path.resolve(__dirname, 'hooks/_execCmd.js')

const serverOnlyModulePaths = [
	'_saveToDisk.js',
	'_execCmd.js',
	'_rmFile.js',
	'_hasDirChanged.js',
	'_existsFile.js',
	'rmDocFile.js',
	'rmFileSelections.js',
	'rmFileVariants.js',
].map(item => path.resolve(__dirname, 'hooks', item)) // '/home/payload/cms/src/hooks/_saveToDisk.js',

const aliases = {}
for (const path of serverOnlyModulePaths) {
	aliases[path] = mockModulePath
}

const fallbacks = {}
for (const path of serverOnlyModulePaths) {
	fallbacks[path] = false
}

export default buildConfig({
	serverURL: process.env.SERVER_URL,
	editor: lexicalEditor({}),
	db: mongooseAdapter({
		url: process.env.DATABASE_URI,
	}),
	admin: {
		user: Users.slug,
		bundler: webpackBundler(),
		webpack: (config) => {
			return {
				...config,
				resolve: {
					...config.resolve,
					fallback: {
						...config.resolve.fallback,
						//stream: false,
						fs: false,
						child_process: false,
						util: false,
						promisify: false,
						assert: false,
						os: false,
						...fallbacks
					},
					alias: {
						...config.resolve.alias,
						...aliases,
						[execCmdPath]: mockModulePath
					},
				},
			}
		},
		css: path.resolve(__dirname, 'assets/custom.css'),
		meta: {
			titleSuffix: '- unonweb',
			//favicon: '/assets/soy-32.png',
			//ogImage: '/assets/puzzle-980.png',
		},
		components: {
			graphics: {
				Logo,
			},
		},
		/* components: {
			afterNavLinks: [
				customComponent
			]
		}, */
	},
	collections: [
		/* Pages */
		Pages,
		PageTemplates,
		/* dynamic content */
		PostsFlex,
		PostTypes,
		Tags,
		/* elements */
		Headers,
		Navs,
		Footers,
		/* upload */
		Images,
		Documents,
		Fonts,
		_FontFamilies,
		/* admin */
		Sites,
		Users,
		//Libraries
	],
	globals: [
		Admin,
	],
	localization: {
		locales: [
			'de',
			'en',
		],
		defaultLocale: 'de', // if no locale is specified, documents will be returned in this locale.
		fallback: true, // If a document is requested in a locale, but a field does not have a localized value corresponding, 
		// then if this property is enabled, the document will automatically fall back to the fallback locale value. If this property is not enabled, the value will not be populated.
	},
	typescript: {
		outputFile: path.resolve(__dirname, 'payload-types.ts'),
	},
	/* SECURITY & LIMITS */
	graphQL: {
		disable: true,
	},
	upload: {
		limits: {
			fileSize: 10000000, // 5MB, written in bytes
		},
	},
	csrf: [
		// CSRF prevention will verify the authenticity of each request to your API to prevent a malicious action from another site from authorized users
		// whitelist of domains to allow cookie auth from
		// tell the Payload API (serverURL, localhost:3000) to allow requests from...
		/* If you are only authenticating via your Payload admin panel, then this does not apply to you. 
		But, if you are using Payload authentication in your own apps and they run on different domains from your Payload API, 
		you might want to whitelist the domains that your own app(s) are running on so that Payload allows access to the HTTP-only cookie accordingly. */
		/* 'https://unonweb.de:3000',
		'https://212.227.171.69:3000',
		'https://localhost:3000',
		'http://unonweb.de:3000',
		'http://212.227.171.69:3000',
		'http://localhost:3000', */
	],
	cors: [
		// Configure the allowed origins for requests to be able to use the Payload API
		// Either a whitelist array of URLS to allow CORS requests from, or a wildcard string ('*') to accept incoming requests from any domain.
		'https://unonweb.de:3000',
		'https://212.227.171.69:3000',
		'https://localhost:3000',
		'http://unonweb.de:3000',
		'http://212.227.171.69:3000',
		'http://localhost:3000',
	],
	rateLimit: {
		window: 9000, // Time in milliseconds to track requests per IP. Defaults to 90000 (15 minutes).
		max: 500, // Number of requests served from a single IP before limiting. Defaults to 500.
	},
	maxDepth: 10,
	indexSortableFields: true,
});