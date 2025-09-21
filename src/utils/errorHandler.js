const logger = require('../utils/logger');
const { INTERNAL_SERVER_ERROR } = require('../config/errorCodes');

/**
 * Responses with a well formatted error and log the error if desired(the second parameter)
 * @param {object} param0
 * @param {import('express').Response} param0.res - The express response object
 * @param {number} [param0.status] - The HTTP status code
 * @param {string} [param0.fieldName] - The name of the field causing the error
 * @param {string} param0.errorCode - The error code which is placed in the body telling the client what went wrong
 * @param {string} param0.message - The response message
 * @param {object} [loggerOptions] - If set, the error will be logged too
 * @param {'error'|'warn'|'info'|'http'|'verbose'|'debug'|'silly'} [loggerOptions.level] - The level of the log; default is warn
 * @param {import('express').Request} loggerOptions.req - The express request object
 * @param {string} loggerOptions.message - The log message
 * @param {object} [loggerOptions.input] - The input data user has passed
 * @param {{ name: string, type: string }} [loggerOptions.file] - The file specs sending log
 * @param {Error} [loggerOptions.error] - The error object
 * @param {object} [loggerOptions.intermediateData] - Some computed data or data derived from database to enhance debug process
 * @returns
 */
const logAndRespond = ({ res, status = 500, fieldName, errorCode, message }, loggerOptions) => {
  if (loggerOptions) {
		const { level = 'warn', message: loggerMessage, req, ...attributes } = loggerOptions;

    logger[level](loggerMessage || message, {
			...attributes,
			req,
			output: {
				errorCode, status, message, fieldName
			}
    })
  }

  return res.status(status).send({
    error: {
      fieldName,
      errorCode,
      message: message || 'Something went wrong on the server'
    }
  })
}

/**
 * Parse custom errors and respond accordingly
 * @param {import('express').Request} req - The express request object
 * @param {import('express').Response} res - The express response object
 * @param {Error} error - The error object
 * @param {{ name: string, type: string }} file - The file specs sending log
 */
const handleError = (req, res, error, file) => {
	const errorObj = {
		res,
		errorCode: error.loppouError?.errorCode || INTERNAL_SERVER_ERROR,
		status: error.loppouError?.status || 500,
		fieldName: error.loppouError?.fieldName,
		message: error.loppouError?.message || 'Something went wrong on the server'
	};

	const level = error.loggerOptions?.level ? error.loggerOptions.level : !!error.loppouError ? 'warn' : 'error';
	logAndRespond(errorObj, {
		level,
		req,
		file,
		error: !!error.loppouError ? undefined : error,
		message: !!error.loppouError ? error.loppouError.message : 'Caught error',
		intermediateData: error.loggerOptions?.intermediateData,
	});
};

/**
 * Generates a custom error object to be used in the application
 * @param {string} message - The error message
 * @param {string} errorCode - The error code which is placed in the body telling the client what went wrong
 * @param {number} [status] - The HTTP status code
 * @param {string} [fieldName] - The name of the field causing the error
 * @param {object} [loggerOptions] - Customizable options for logger
 * @param {'error'|'warn'|'info'|'http'|'verbose'|'debug'|'silly'} [loggerOptions.level] - The level of the log
 * @param {Object} [loggerOptions.intermediateData] - Some computed data or data derived from database to enhance debug process
 * @returns {{ loppouError: { message: string, errorCode: string, status: number, fieldName?: string } }} - The custom error object
 */
const CustomError = (message, errorCode, status = 500, fieldName, loggerOptions) => ({ loppouError: { message, errorCode, status, fieldName }, loggerOptions });

module.exports = { logAndRespond, handleError, CustomError }
