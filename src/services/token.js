const jwt = require('jsonwebtoken');

const {
	JWT_ACCESS_EXPIRATION,
	JWT_REFRESH_EXPIRATION,
	JWT_ACCESS_SECRET_KEY,
	JWT_REFRESH_SECRET_KEY,
	JWT_EMAIL_VERIFICATION_EXPIRATION,
	JWT_EMAIL_VERIFICATION_SECRET_KEY,
	FILE_TYPES,
} = require('../config');
const logger = require('../utils/logger');
const { AUTH_ERRORS } = require('../config/errorCodes');
const { CustomError } = require('../utils/errorHandler');

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
		logger.debug('Verifying token', {
			req, file: { name: __filename, type: FILE_TYPES.SERVICE },
			intermediateData: { token },
		});

		const decoded = jwt.verify(token, secret);

		logger.debug('Verified token successfully', {
			req, file: { name: __filename, type: FILE_TYPES.SERVICE },
			intermediateData: { token, decoded },
		});

		return decoded
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
      throw CustomError('Token has expired', AUTH_ERRORS.TOKEN_EXPIRED, 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw CustomError('Token is invalid', AUTH_ERRORS.TOKEN_INVALID, 401);
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

/**
 * Validates email verification token
 * @param {string} token - The verification token to validate
 * @param {import('express').Request} req - The request object for logging context
 * @returns {object} - The decoded token if valid
 * @throws {Error} - Throws an error if the token is invalid or expired
 */
const validateEmailVerificationToken = (token, req = {}) => {
	return validateToken(token, JWT_EMAIL_VERIFICATION_SECRET_KEY, req);
};

/**
 * Generates an email verification token
 * @param {string} email - User's email
 * @param {string} _id - User's unique identifier
 * @param {import('express').Request} req - The request object for logging context
 * @returns {string} - The email verification token
 */
const generateEmailVerificationToken = (email, _id, req = {}) => {
	logger.verbose('Generating email verification token', {
		req, file: { name: __filename, type: FILE_TYPES.SERVICE },
		intermediateData: { email, _id },
	});

	const emailToken = jwt.sign(
		{ email, _id },
		JWT_EMAIL_VERIFICATION_SECRET_KEY,
		{ expiresIn: JWT_EMAIL_VERIFICATION_EXPIRATION }
	);

	logger.info('Generated email verification token', {
		req, file: { name: __filename, type: FILE_TYPES.SERVICE },
		intermediateData: { emailToken },
	});

	return emailToken;
};

module.exports = {
	generateAuthTokens,
	validateAccessToken,
	validateRefreshToken,
	generateEmailVerificationToken,
	validateEmailVerificationToken
};