const { isString, isObjectId } = require('../validators');
const generator = require('../generator');

const fields = {
	note: {
		required: true,
		validator: isString
	},
	company: {
		required: true,
		validator: isObjectId
	}
};

module.exports = generator(fields, 'body', __filename);