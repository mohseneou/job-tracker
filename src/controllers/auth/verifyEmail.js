const User = require('../../models/user');

const logger = require('../../utils/logger');
const { FILE_TYPES } = require('../../config');
const { handleControllerError } = require('../errorHandler');
const { validateEmailVerificationToken } = require('../../services/token');
const { handleError } = require('../../utils/errorHandler');
const { AUTH_ERRORS } = require('../../config/errorCodes');

/**
 * Controller to handle email verification
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object 
 */
const verifyEmail = async (req, res) => {
	logger.info('Start user email verification process', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
	});

	try {
		const token = req.params.token;

		// Verify token
		const decoded = validateEmailVerificationToken(token, req);

		// Check if user exists
		const user = await User.findById(decoded._id);
		if (!user) {
			return handleError({
				res, message: 'User not found', statusCode: 404, errorCode: AUTH_ERRORS.USER_NOT_FOUND
			}, {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { decoded }
			});
		}

		// Check if email is already verified
		if (user.emailVerified) {
			return handleError({
				res, message: 'Email is already verified', statusCode: 400, errorCode: AUTH_ERRORS.ALREADY_VERIFIED
			}, {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { user }
			});
		}

		// Update user's record in database to mark the email as verified
		await User.updateOne({ _id: decoded._id }, { emailVerified: true });

		const response = { message: 'Email verified successfully' };

		logger.info('User email verified successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { userId: decoded._id, email: decoded.email },
			response
		});

		res.status(200).json(response);
	} catch (error) {
		handleControllerError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = verifyEmail;