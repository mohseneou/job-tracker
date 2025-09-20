const bcrypt = require('bcryptjs');

const User = require('../../models/user');

const logger = require('../../utils/logger');
const { FILE_TYPES } = require('../../config');
const { CustomError, handleError } = require('../../utils/errorHandler');
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
			throw CustomError('Invalid credentials', AUTH_ERRORS.INVALID_CREDENTIALS, 404);
		}

		logger.verbose('Found user on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
		});

		// Check if password is correct
		const isMatch = bcrypt.compareSync(password, user.password);
		if (!isMatch) {
			throw CustomError('Invalid credentials', AUTH_ERRORS.INVALID_CREDENTIALS, 404);
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
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = login;