const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../../models/user');
const Profile = require('../../models/profile');

const { generateAuthTokens } = require('../../services/token');
const logger = require('../../utils/logger');
const { handleError } = require('../../utils/errorHandler');
const { FILE_TYPES, HASH_SALT_ROUNDS } = require('../../config');
const { INTERNAL_SERVER_ERROR, AUTH_ERRORS } = require('../../config/errorCodes');

const signup = async (req, res) => {
	const { name, email, password } = req.body;

	logger.info('Start user signup process', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
	});

	let session;

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return handleError({
				res, status: 400, fieldName: 'email', errorCode: AUTH_ERRORS.EMAIL_IN_USE, message: 'Email is already in use'
			}, {
				level: 'info',
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				message: 'Attempt to register with an existing email',
			});
		}

		// Create a session for transaction
		session = await mongoose.startSession();

		logger.debug('Strated a new mongoose session for transaction', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Use transaction to ensure both user and profile are created
		await session.withTransaction(async () => {
			// Create a new user
			const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);
			const newUser = new User({
				name,
				email: email.toLowerCase(),
				password: hashedPassword,
			});
			await newUser.save({ session });

			logger.verbose('Created a new user on database', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { newUser },
			});

			// Create a new profile document for the user
			const newProfile = new Profile({ user: newUser._id });
			await newProfile.save({ session });

			logger.verbose('Created a new profile on database', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { newProfile },
			});

			// Now generate tokens and send response
			const tokens = generateAuthTokens(newUser.email, newUser._id.toString(), newUser.role, req);

			const response = { user: { name, email, _id: newUser._id }, tokens };
		
			logger.info('User signup process completed successfully', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				response: response,
				intermediateData: { newUser, newProfile },
			});

			res.status(201).json(response);

		});

	} catch (error) {
		handleError({
			res, status: 500, errorCode: INTERNAL_SERVER_ERROR, message: 'Something went wrong on the server'
		}, {
			level: 'error',
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			message: 'Caught error',
			error,
		});
	} finally {
		if (session) {
			session.endSession();
			logger.debug('Ended mongoose session', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			});
		}
	}
};

module.exports = signup;