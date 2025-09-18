const bcrypt = require('bcryptjs');

const User = require('../../models/user');

const logger = require('../../utils/logger');
const { FILE_TYPES } = require('../../config');
const { handleControllerError } = require('../errorHandler');
const { handleError } = require('../../utils/errorHandler');
const { AUTH_ERRORS } = require('../../config/errorCodes');
const { generateAuthTokens } = require('../../services/token');

/**
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object 
 */
const login = async (req, res) => {
	logger.info('Start user login process', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
	});

	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return handleError({
				res,
				message: 'Invalid credentials',
				statusCode: 404,
				errorCode: AUTH_ERRORS.INVALID_CREDENTIALS,
			}, {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				message: 'Email does not exist',
				level: 'info',
			});
		}

		logger.verbose('Found user on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
		});

		// Check if password is correct
		const isMatch = bcrypt.compareSync(password, user.password);
		if (!isMatch) {
			return handleError({
				res,
				message: 'Invalid credentials',
				statusCode: 404,
				errorCode: AUTH_ERRORS.INVALID_CREDENTIALS,
			}, {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				message: 'Password is incorrect',
				level: 'info',
			});
		}

		// Generate auth tokens
		const tokens = generateAuthTokens(user.email, user._id.toString(), user.role, req);

		const response = { tokens, user: { email: user.email, _id: user._id.toString(), role: user.role } };

		logger.info('Login successful', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
			output: response,
		});

		res.status(200).send(response);

	} catch (error) {
		handleControllerError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = login;