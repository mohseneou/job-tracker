const { isString, isEmail } = require('../validators');
const generator = require('../generator');

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

module.exports = generator(fields, 'body', __filename);