const Company = require('../../models/company');

const { FILE_TYPES } = require('../../config');
const { COMPANY_ERRORS } = require('../../config/errorCodes');
const { CustomError, handleError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');


/**
 * List companies
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express request object
 */
const list = async (req, res) => {
	try {
		logger.info('Start listing companies', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		const { sort = 'updatedAt:-1', select = '', page = 1, limit = 10, status } = req.query;

		const filter = status ? { status } : {};
		const sortArr = sort.split(':');
		const skip = (page - 1) * +limit;

		// Build query object
		const query = Company.find(filter)
			.sort({ [sortArr[0]]: +sortArr[1] })
			.limit(+limit)
			.skip(skip)
			.select(select.replaceAll(',', ' '));

		// Await query
		const companies = await query;

		const response = { companies };

		logger.info('Fetched companies list successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			output: response,
		});

		res.send(response);
	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = list;