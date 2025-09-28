const ckeckForErrors = require('./checkForErrors');
const { logAndRespond } = require('../utils/errorHandler');
const { INVALID_INPUT } = require('../config/errorCodes');
const { FILE_TYPES } = require('../config');

/**
 * Generate validator middleware based off fields configuration
 * @param {{ [field: string]: { required?: boolean, validator: (any) => boolean } }} fields - An object indicationg fields and corresponding validations
 * @param {'query'|'body'|'params'} data - Where data is coming from 
 * @param {string} filename - The file name (for logging)
 * @returns {import('express').RequestHandler}
 */
const generator = (fields, data, filename) => (req, res, next) => {
	// Check for errors
	const result = ckeckForErrors(fields, req[data]);
	
	// If there are errors, return 422 with the error message
	if (!result.valid) {
		return logAndRespond({
			res, statusCode: 422, message: result.message, errorCode: INVALID_INPUT 
		}, {
			req, file: { name: filename, type: FILE_TYPES.VALIDATOR },
		});
	}

	next();
}


module.exports = generator;