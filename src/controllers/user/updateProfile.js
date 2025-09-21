const User = require('../../models/user');
const Profile = require('../../models/profile');

const { CustomError, handleError } = require('../../utils/errorHandler');
const { FILE_TYPES } = require('../../config');
const { USER_ERRORS } = require('../../config/errorCodes');
const logger = require('../../utils/logger');

const updateProfile = async (req, res) => {
	try {
		logger.info('Start updating user profile', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Check if user exists
		const user = await User.findById(req.user._id);
		if (!user) {
			throw CustomError('User not found', USER_ERRORS.USER_NOT_FOUND, 404);
		}

		// Extract updates from request body
		const updates = { ...req.body };

		// Define updatable fields
		const updatableFields = ['resumeURL', 'coverLetter', 'skills', 'LinkedInURL'];

		// Remove non-updatable fields from updates
		for (const key in updates) {
			if (!updatableFields.includes(key)) {
				delete updates[key];
			}
		}

		logger.debug('Built update object', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { updates },
		});

		// Update user profile
		const profile = await Profile.findOneAndUpdate(
			{ user: req.user._id },
			{ $set: updates },
			{ new: true, runValidators: true }
		).lean();

		if (!profile) {
			throw CustomError('User profile not found', USER_ERRORS.USER_PROFILE_NOT_FOUND, 404);
		}

		const response = { message: 'Profile updated successfully', profile };

		logger.info('Updated user profile successfully', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			output: response,
		});

		delete profile._id;
		delete profile.user;

		res.send(response);

	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
	}
};

module.exports = updateProfile;
