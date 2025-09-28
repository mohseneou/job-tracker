const { isString, isStringArray, isURL } = require('../validators');
const generator = require('../generator');

const fields = {
	resumeURL: {
		validator: isURL,
	},
	coverLetter: {
		validator: v => isString(v, 1000)
	},
	skills: {
		validator: isStringArray,
	},
	LinkedInURL: {
		validator: isURL,
	},
};

module.exports = generator(fields, 'body', __filename);