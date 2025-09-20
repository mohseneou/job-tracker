const { isString, isStringArray, isURL } = require('../validators');
const ckeckForErrors = require('../checkForErrors');
const { logAndRespond } = require('../../utils/errorHandler');
const { INVALID_INPUT } = require('../../config/errorCodes');
const { FILE_TYPES } = require('../../config');

const fields = {
	resumeURL: {
		required: false,
		validator: isURL,
	},
	coverLetter: {
		required: false,
		validator: v => isString(v, 1000)
	},
	skills: {
		required: false,
		validator: isStringArray,
	},
	LinkedInURL: {
		required: false,
		validator: isURL,
	},
};

const updateProfile = (req, res, next) => {
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

module.exports = updateProfile;