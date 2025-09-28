const { isObjectId } = require('../validators');
const generator = require('../generator');

const fields = {
	id: {
		required: true,
		validator: isObjectId
	}
};

module.exports = generator(fields, 'params', __filename)