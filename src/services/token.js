const jwt = require('jsonwebtoken');

const {
	JWT_ACCESS_EXPIRATION,
	JWT_REFRESH_EXPIRATION,
	JWT_ACCESS_SECRET_KEY,
	JWT_REFRESH_SECRET_KEY,
	FILE_TYPES,
} = require('../config');
const logger = require('../utils/logger');
const { AUTH_ERRORS } = require('../config/errorCodes');

/**
 * Generates access and refresh tokens for a user
 * @param {string} email - User's email
 * @param {string} _id - User's unique identifier
 * @param {string} role - User's role
 * @param {import('express').Request} req - The request object for logging context
 * @returns {{ access: string, refresh: string } 
 */
const generateAuthTokens = (email, _id, role, req = {}) => {
	logger.verbose('Generating new auth tokens', {
		req, file: { name: __filename, type: FILE_TYPES.SERVICE },
		intermediateData: { email, _id, role },
	});

	const accessToken = jwt.sign(
		{ email, _id, role },
		JWT_ACCESS_SECRET_KEY,
		{ expiresIn: JWT_ACCESS_EXPIRATION }
	);
	const refreshToken = jwt.sign(
		{ email, _id, role },
		JWT_REFRESH_SECRET_KEY,
		{ expiresIn: JWT_REFRESH_EXPIRATION }
	);

	logger.info('Generated auth tokens', {
		req, file: { name: __filename, type: FILE_TYPES.SERVICE },
		intermediateData: { accessToken, refreshToken },
	});

	return { access: accessToken, refresh: refreshToken };
};

/**
 * Validates a JWT token
 * @param {string} token - The JWT token to validate
 * @param {string} secret - The secret key to verify the token
 * @param {import('express').Request} req - The request object for logging context
 * @returns {object} - The decoded token if valid
 * @throws {Error} - Throws an error if the token is invalid or expired
 */
const validateToken = (token, secret, req = {}) => {
	try {
		return jwt.verify(token, secret);
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
      throw new Error({
				loppouError: true,
				error: {
					errorCode: AUTH_ERRORS.TOKEN_EXPIRED,
					message: 'Token has expired',
					code: 401,
				}
			})
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error({
				loppouError: true,
				error: {
					errorCode: AUTH_ERRORS.TOKEN_INVALID,
					message: 'Token is invalid',
					code: 401,
				}
			})
    } else {
      throw error
    }
	}
};

/**
 * Validates a refresh token
 * @param {string} token - The refresh token to validate
 * @param {import('express').Request} req - The request object for logging context
 * @returns {object} - The decoded token if valid
 * @throws {Error} - Throws an error if the token is invalid or expired
 */
const validateRefreshToken = (token, req = {}) => {
	return validateToken(token, JWT_REFRESH_SECRET_KEY, req);
};

/**
 * Validates an access token
 * @param {string} token - The access token to validate
 * @param {import('express').Request} req - The request object for logging context
 * @returns {object} - The decoded token if valid
 * @throws {Error} - Throws an error if the token is invalid or expired
 */
const validateAccessToken = (token, req = {}) => {
	return validateToken(token, JWT_ACCESS_SECRET_KEY, req);
};

module.exports = {
	generateAuthTokens,
	validateAccessToken,
	validateRefreshToken,
};