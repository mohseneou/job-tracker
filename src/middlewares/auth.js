const { FILE_TYPES } = require('../config');
const { AUTH_ERRORS } = require('../config/errorCodes');
const { CustomError, handleError } = require('../utils/errorHandler');
const { validateAccessToken } = require('../services/token');

/**
 * Authorize user based on token in request header
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next  - Express next middleware function
 */
const auth = (req, res, next) => {
	const token = req.header('Authorization')	? req.header('Authorization').replace('Bearer ', '') : null;

	// Respond with 401 if no token is provided
	if (!token) {
		throw CustomError('No token, authorization denied', AUTH_ERRORS.NO_TOKEN_PROVIDED, 401);
	}
	
	try {
		// Verify token
		const decoded = validateAccessToken(token, req);

		// Set user to request
		req.user = decoded;

		next();
	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.MIDDLEWARE });
	}
};

module.exports = auth;
