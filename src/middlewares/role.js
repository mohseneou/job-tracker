const { FILE_TYPES } = require('../config');
const { ROLE_ERRORS } = require('../config/errorCodes');
const { CustomError, handleError } = require('../utils/errorHandler');

// Map role types to numbers to enable role comparison (the higher the role number, the more access it has to resources)
const ROLES = {
	user: 3,
	'job-poster': 9,
	admin: 20
};

/**
 * Check whether user has the minimum role required for the specified resource or not
 * @param {'user'|'job-poster'|'admin'} minimumRole - The minimum role user needs to have in order to access the resource
 * @returns {import('express').RequestHandler} - The middleware function
 */
const role = (minimumRole) => {
	return (req, res, next) => {
		try {
			// Map roles to numbers
			const userRoleNo = ROLES[req.user.role];
			const minRoleNo = ROLES[minimumRole];

			// Check if user has the minimum access required
			if (userRoleNo < minRoleNo) {
				throw CustomError('Access denied', ROLE_ERRORS.ACCESS_DENIED, 403);
			}

			next();
		} catch (error) {
			handleError(req, res, error, { name: __filename, type: FILE_TYPES.MIDDLEWARE });
		}
	};
};

module.exports = {
	admin: role('admin'),
	jobPoster: role('job-poster'),
	user: role('user')
};
