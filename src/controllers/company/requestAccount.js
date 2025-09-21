const User = require('../../models/user');
const Company = require('../../models/company');

const logger = require('../../utils/logger');
const { CustomError, handleError } = require('../../utils/errorHandler');
const { FILE_TYPES } = require('../../config');
const { USER_ERRORS, COMPANY_ERRORS } = require('../../config/errorCodes');

/**
 * Request a job poster account by creating a company account
 * @param {import('express').Request} req - Express request object 
 * @param {import('express').Response} res - Express response object
 */
const requestAccount = async (req, res) => {
	try {
		logger.info('Start creating a company account request', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Check if user exists
		const user = await User.findById(req.user._id);
		if (!user) {
			throw CustomError('User not found', USER_ERRORS.USER_NOT_FOUND, 404);
		}

		logger.debug('Found user on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user },
		});

		// Check if user has already requested a company account
		const existingCompany = await Company.findOne({ user: user._id });
		if (existingCompany) {
			throw CustomError('Already a job poster', COMPANY_ERRORS.ALREADY_JOB_POSTER, 400, undefined, { intermediateData: { user } });
		}

		// Create a pending company account
		const { name, website, employeeCount, description } = req.body;
		const company = new Company({ name, website, employeeCount, description, user: user._id });
		await company.save();

		logger.debug('Created a pending pending company account', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user, company },
		});

		const response = { message: 'Company account request created successfully. Your request will be checked by our admins.' };

		logger.info('Created a company account request successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user, company },
			output: response,
		});

		res.status(201).send(response);

	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = requestAccount;