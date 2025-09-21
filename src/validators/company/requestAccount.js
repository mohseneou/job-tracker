const { isString, isURL, isNumber } = require('../validators');
const ckeckForErrors = require('../checkForErrors');
const { logAndRespond } = require('../../utils/errorHandler');
const { INVALID_INPUT } = require('../../config/errorCodes');
const { FILE_TYPES } = require('../../config');

const fields = {
	name: {
		required: true,
		validator: v => isString(v, 100),
	},
	website: {
		required: true,
		validator: isURL,
	},
	employeeCount: {
		required: true,
		validator: v => isNumber(v, 1),
	},
	description: {
		required: true,
		validator: v => isString(v, 1000)
	},
};

const requestAccount = (req, res, next) => {
	// Check for errors
	const result = ckeckForErrors(fields, req.body);
	
	// If there are errors, return 422 with the error message
	if (!result.valid) {
		return logAndRespond({
			res, statusCode: 422, message: result.message, errorCode: INVALID_INPUT 
		}, {
			req, file: { name: __filename, type: FILE_TYPES.VALIDATOR },
		});
	}

	next();
};

module.exports = requestAccount;