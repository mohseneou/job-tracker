const { isString, isEmail } = require('../validators');
const ckeckForErrors = require('../checkForErrors');
const { logAndRespond } = require('../../utils/errorHandler');
const { INVALID_INPUT } = require('../../config/errorCodes');
const { FILE_TYPES } = require('../../config');

const fields = {
	name: {
		required: true,
		validator: isString,
	},
	email: {
		required: true,
		validator: isEmail,
	},
	password: {
		required: true,
		validator: isString,
	},
};

const signupValidator = (req, res, next) => {
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

module.exports = signupValidator;