const { FILE_TYPES } = require('../config');
const { AUTH_ERRORS } = require('../config/errorCodes');
const { CustomError, handleError } = require('../utils/errorHandler');
const { validateAccessToken, validateRefreshToken } = require('../services/token');

/**
 * Authenticate user using different token types
 * @param {'accessToken'|'refreshToken'} tokenType - Type of token to validate
 * @returns {import('express').RequestHandler} - The middleware function
 */
const auth = (tokenType) => {
	const validatorFunction = tokenType === 'accessToken' ? validateAccessToken : validateRefreshToken;

	return (req, res, next) => {
		const token = req.header('Authorization')	? req.header('Authorization').replace('Bearer ', '') : null;
		
		try {
			// Respond with 401 if no token is provided
			if (!token) {
				throw CustomError('No token, authorization denied', AUTH_ERRORS.NO_TOKEN_PROVIDED, 401);
			}

			// Verify token
			const decoded = validatorFunction(token, req);

			// Set user to request
			req.user = decoded;

			next();
		} catch (error) {
			handleError(req, res, error, { name: __filename, type: FILE_TYPES.MIDDLEWARE });
		}
	};
};

module.exports = {
	accessToken: auth('accessToken'),
	refreshToken: auth('refreshToken'),
};
