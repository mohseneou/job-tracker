const { handleError } = require('../utils/errorHandler');
const { INTERNAL_SERVER_ERROR } = require('../config/errorCodes');

/**
 * Responses with a well formatted error and log the error
 * @param {import('express').Request} req - The express request object
 * @param {import('express').Response} res - The express response object
 * @param {Error} error - The error object
 * @param {{ name: string, type: string }} file - The file specs sending log
 */
const handleControllerError = (req, res, error, file) => {
	const errorObj = {
		res,
		errorCode: error.loppouError?.errorCode || INTERNAL_SERVER_ERROR,
		status: error.loppouError?.status || 500,
		fieldName: error.loppouError?.fieldName,
		message: error.loppouError?.message || 'Something went wrong on the server'
	};

	handleError(errorObj, {
		level: !!error.loppouError ? 'warn' : 'error',
		req,
		file,
		error: !!error.loppouError ? undefined : error,
		message: !!error.loppouError ? error.loppouError.message : 'Caught error',
	});
};

module.exports = { handleControllerError };
