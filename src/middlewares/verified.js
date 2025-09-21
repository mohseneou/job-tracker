const User = require('../models/user');

const { FILE_TYPES } = require('../config');
const { USER_ERRORS } = require('../config/errorCodes');
const { CustomError, handleError } = require('../utils/errorHandler');

/**
 * Check whether user has verified their email address
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const verified = async (req, res, next) => {
	try {
		// Try to find user on database
		const user = await User.findById(req.user._id).lean();

		// Check if email is verified
		if (!user?.emailVerified) {
			throw CustomError('Email is not verified', USER_ERRORS.EMAIL_IS_NOT_VERIFIED, 403, undefined, { intermediateData: { user } });
		}

		// Email is verified, call the next middleware
		next();
	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.MIDDLEWARE });
	}
};

module.exports = verified;
