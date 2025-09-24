const User = require('../../models/user');
const Company = require('../../models/company');

const logger = require('../../utils/logger');
const { CustomError, handleError } = require('../../utils/errorHandler');
const { FILE_TYPES } = require('../../config');
const { USER_ERRORS, COMPANY_ERRORS } = require('../../config/errorCodes');

/**
 * Resubmit job poster account request
 * @param {import('express').Request} req - Express request object 
 * @param {import('express').Response} res - Express response object
 */
const reSubmitRequestAccount = async (req, res) => {
	try {
		logger.info('Start re-submitting a company account request', {
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

		// Find the current company document
		const company = await Company.findOne({ user: user._id });
		if (!company) {
			throw CustomError('Company not found', COMPANY_ERRORS.COMPANY_NOT_FOUND, 404, undefined, { intermediateData: { user } });
		}

		logger.debug('Found company on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user, company },
		});

		// Check if company is in rejeceted state
		if (company.status !== 'rejected') {
			throw CustomError('Not in rejected state', COMPANY_ERRORS.COMPANY_IS_NOT_REJECTED, 400, undefined, { intermediateData: { user, company } });
		}

		// Update company
		const updates = { name, website, employeeCount, description } = req.body;
		Object.keys(updates).forEach(key => {
			company[key] = updates[key];
		});

		// Set company back to pending mode
		company.status = 'pending';

		await company.save();
		

		const response = { message: 'Company account request updated successfully.' };

		logger.info('Re-submitted company account request successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { user, company },
			output: response,
		});

		res.send(response);

	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = reSubmitRequestAccount;