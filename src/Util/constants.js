exports.DEFAULTS = {
	HEADERS: {
		'X-DNS-Prefetch-Control': false,
		'X-Frame-Options': { action: 'sameorigin' },
		'X-Powered-By': false,
		'Strict-Transport-Security': {
			maxAge: 5184000,
			includeSubDomains: true
		},
		'X-Download-Options': true,
		'X-Content-Type-Options': true,
		'X-XSS-Protection': true
	},
	MIMETYPES: {
		default: 'text/plain',
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.jpg': 'image/jpeg',
		'.png': 'image/png',
		'.ico': 'image/x-icon'
	}
};
