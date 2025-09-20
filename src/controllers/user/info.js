const User = require('../../models/user');

const { USER_ERRORS } = require('../../config/errorCodes');
const { handleError, CustomError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const { FILE_TYPES } = require('../../config');

/**
 * Find user info controller
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const info = async (req, res) => {
	try {
		logger.info('Start getting user info process', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Try to find the user
		const user = await User.findById(req.user._id).select('-password').lean();

		if (!user) {
			throw CustomError('User not found', USER_ERRORS.USER_NOT_FOUND, 404, '_id');
		}

		const response = { user };

		logger.info('Found user info', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			output: response,
		});

		res.send(response);
	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = info;