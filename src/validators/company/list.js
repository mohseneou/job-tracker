const { isSelect, isNumber, isSort, isString } = require('../validators');
const generator = require('../generator');

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

module.exports = generator(fields, 'query', __filename);