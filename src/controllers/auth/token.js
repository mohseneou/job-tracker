const User = require('../../models/user');

const { generateAuthTokens } = require('../../services/token');
const { CustomError, handleError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const { FILE_TYPES } = require('../../config');
const { AUTH_ERRORS } = require('../../config/errorCodes');

/**
 * Generate new refresh and access token
 * @param {import('express').Request} req - Express request object 
 * @param {import('express').Response} res - Express response object
 */
const token = async (req, res) => {
	try {
		logger.info('Start generating new refresh and access token', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Try to find user on database
		const user = await User.findById(req.user._id).lean();
		if (!user) {
			throw CustomError('User not found', AUTH_ERRORS.USER_NOT_FOUND, 404);
		}

		logger.debug('Found user on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
		});

		// Generate new tokens
		const tokens = generateAuthTokens(user.email, user._id.toString(), user.role, req);

		const response = { tokens };

		logger.info('Generated new tokens successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
			output: response,
		});

		res.send(response);
	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER })
	}
};

module.exports = token;