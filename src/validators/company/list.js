const { isSelect, isNumber, isSort, isString } = require('../validators');
const ckeckForErrors = require('../checkForErrors');
const { logAndRespond } = require('../../utils/errorHandler');
const { INVALID_INPUT } = require('../../config/errorCodes');
const { FILE_TYPES } = require('../../config');

const fields = {
	sort: {
		validator: isSort
	},
	page: {
		validator: v => isNumber(v, 1)
	},
	limit: {
		validator: v => isNumber(v, 1)
	},
	select: {
		validator: isSelect
	},
	status: {
		validator: isString
	},
};

const list = (req, res, next) => {
	// Check for errors
	const result = ckeckForErrors(fields, req.query);

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

module.exports = list;