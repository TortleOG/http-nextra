class Piece {

	constructor(router, name, method, middlewares, condition, callback) {
		/**
		 * The type of the piece
		 * @since 0.0.1
		 * @type {string}
		 */
		this.type = 'Piece';

		/**
		 * Whether the piece holds a variable or not
		 * @since 0.0.1
		 * @type {boolean}
		 * @private
		 */
		this._variable = name.startsWith(':');

		/**
		 * The name of the piece
		 * @since 0.0.1
		 * @type {string}
		 */
		this.name = this._variable ? name.slice(1, name.length) : name;

		/**
		 * The request method this piece is meant to run
		 * @since 0.0.1
		 * @type {string}
		 */
		this.method = method;

		this._middlewares = middlewares;

		/**
		 * The inhibitor condition
		 * @since 0.0.1
		 * @type {?Function}
		 */
		this._condition = condition;

		/**
		 * The callback to run
		 * @since 0.0.1
		 * @type {Function}
		 */
		this._callback = callback;
	}

	/**
	 * Run the Piece
	 * @since 0.0.1
	 * @param {Request} request The request
	 * @param {Response} response The response
	 * @param {*} options The options
	 * @returns {boolean}
	 */
	async run(request, response, options) {
		const shouldRun = this._condition ?
			await this._condition(request, response, options) :
			true;

		if (shouldRun) {
			if (this._middlewares) await Promise.all(this._middlewares.map(ware => ware(request, response)));
			this._callback(request, response, options);
			return true;
		} else if (this._onInhibit) {
			this._onInhibit(request, response, options);
			return true;
		}
		return false;
	}

	/**
	 * Check if it's a valid path
	 * @since 0.0.1
	 * @param {string[]} parts The parts of the patch
	 * @param {Request} request The request
	 * @param {Response} response The response
	 * @param {*} options The options
	 * @returns {(this|false)}
	 */
	isPath(parts, request, response, options) {
		if (request.method !== this.method || parts.length > 1) return false;
		if (this._variable) [options[this.name]] = parts;
		return this.name === parts[0] || this._variable ? this : false;
	}

}

module.exports = Piece;
