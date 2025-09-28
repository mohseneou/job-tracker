const Company = require('../../models/company');

const { FILE_TYPES } = require('../../config');
const { handleError, CustomError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const { COMPANY_ERRORS } = require('../../config/errorCodes');

/**
 * Find one company and return it
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getOne = async (req, res) => {
	try {
		logger.info('Start getting company', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		const { id } = req.params;

		const company = await Company.findById(id).populate({
			path: 'user',
			select: '-password'
		});
		if (!company) {
			throw CustomError('Company not found', COMPANY_ERRORS.COMPANY_NOT_FOUND, 404);
		}

		const response = { company };

		logger.info('Found company', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		res.send(response);

	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER })
	}
};

module.exports = getOne;