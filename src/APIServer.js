const { Server, IncomingMessage, ServerResponse } = require('http');
const { parse } = require('url');
const { scan } = require('fs-nextra');

const Router = require('./Router/Router');
const ResponseNextra = require('./ResponseNextra');
const builders = require('./headerBuilder');

ServerResponse.prototype = new ResponseNextra(IncomingMessage);

/**
 * A class that extends http.Server with a built in router for HTTP requests.
 * @extends http.Server
 */
class APIServer extends Server {

	/**
	 * Creates a new HTTP server
	 * @param {Object} options Any object
	 * @param {Function} listener A listener for HTTP requests. Arguments are `request` and `response`
	 */
	constructor(options = {}, listener) {
		super((request, response) => {
			Object.defineProperty(response, 'request', { value: request });
			listener(request, response);
		});

		/**
		 * The main router
		 * @since 0.0.1
		 * @type {Router}
		 */
		this.router = new Router(this, '/');

		/**
		 * Options for this server
		 * @type {Object}
		 */
		this.options = options;

		/**
		 * The HTTP headers to set
		 * @type {Object}
		 */
		this.options.headers = options.headers || DEFAULT_HEADERS;

		const { def, ...extras } = this.options.headers;

		if (typeof def === 'boolean' && def) this.rawHeaders = extras ? { ...DEFAULT_HEADERS, ...extras } : { ...DEFAULT_HEADERS };
		else if (typeof def === 'boolean' && !def) this.rawHeaders = extras ? { ...extras } : { };
		else if (typeof def === 'undefined') this.rawHeaders = extras ? { ...extras } : { ...DEFAULT_HEADERS };

		/**
		 * Built HTTP headers from the raw headers option
		 * @type {Object}
		 */
		this.headers = this.buildHeaders(this.rawHeaders);

		Object.defineProperty(ServerResponse.prototype, 'server', { value: this });
	}

	/**
	 * Builds HTTP response headers.
	 * @param {Object} opts The header options for this server
	 * @returns {Object} The built headers.
	 */
	buildHeaders(opts) {
		const ret = {};
		for (const [header, headerOpts] of Object.entries(opts)) {
			const built = builders[header] ? builders[header](headerOpts) : null;
			if (!built) continue;
			ret[header] = built;
		}
		return ret;
	}

	favicon(path) {
		this.router.add('favicon.ico', 'GET', (request, response) => response.sendFile(path));
	}

	async static(route, dir) {
		if (typeof route === 'string' && typeof dir === 'undefined') {
			dir = route;
			route = null;
		}

		const paths = await scan(dir, { filter: (stats, path) => path.lastIndexOf('/') < path.lastIndexOf('.') });

		for (const path of paths.keys()) {
			const pathname = parse(path).path.slice(dir.lastIndexOf('/') - 1).substr(dir.substr(dir.lastIndexOf('/')).length);

			if (this.router.paths.includes(pathname)) continue;

			this.router.add(pathname, 'GET', (request, response) => response.sendFile(path));
		}
	}

}

const DEFAULT_HEADERS = {
	'X-DNS-Prefetch-Control': { allow: false },
	'X-Frame-Options': { action: 'sameorigin' },
	'X-Powered-By': false,
	'Strict-Transport-Security': {
		maxAge: 5184000,
		includeSubDomains: true
	},
	'X-Download-Options': true,
	'X-Content-Type-Options': true,
	'X-XSS-Protection': true
};

module.exports = APIServer;
