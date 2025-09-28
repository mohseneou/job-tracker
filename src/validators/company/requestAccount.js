const { isString, isURL, isNumber } = require('../validators');
const generator = require('../generator');

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

module.exports = generator(fields, 'body', __filename);