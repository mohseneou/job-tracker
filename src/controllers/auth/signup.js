const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../../models/user');
const Profile = require('../../models/profile');

const { generateAuthTokens, generateEmailVerificationToken } = require('../../services/token');
const logger = require('../../utils/logger');
const { CustomError, handleError } = require('../../utils/errorHandler');
const { FILE_TYPES, HASH_SALT_ROUNDS, API_URL } = require('../../config');
const { AUTH_ERRORS } = require('../../config/errorCodes');
const sendEmail = require('../../utils/sendMail');

const generateVerificationEmail = (verificationToken, user, req = {}) => {
	logger.verbose('Generating email verification content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { verificationToken, user },
	});

	const verificationLink = `${API_URL}/auth/verify-email/${verificationToken}`;

	const textContent = `Hello ${user.name},
Please verify your email by clicking the link below:
${verificationLink}
If you did not create an account, please ignore this email.
Thank you!`;

	const htmlContent = `<p>Hello ${user.name},</p>
<p>Please verify your email by clicking the link below:</p>
<p><a href="${verificationLink}">Verify Email</a></p>
<p>If you did not create an account, please ignore this email.</p>
<p>Thank you!</p>`;

	logger.verbose('Generated email verification content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { textContent },
	});

	return { text: textContent, html: htmlContent };
};

/**
 * User signup controller
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 */
const signup = async (req, res) => {
	const { name, email, password } = req.body;

	logger.info('Start user signup process', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
	});

	let session;

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
		if (existingUser) {
			throw CustomError('Email is already in use', AUTH_ERRORS.EMAIL_IN_USE, 400, undefined, { intermediateData: { existingUser }, level: 'info' });
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

			// Generate email verification token
			const emailVerificationToken = generateEmailVerificationToken(newUser.email, newUser._id.toString(), req);

			// Send verification email
			const verificationEmailContent = generateVerificationEmail(emailVerificationToken, newUser, req);
			await sendEmail({
				to: newUser.email,
				subject: 'Verify your email',
				text: verificationEmailContent.text,
				html: verificationEmailContent.html,
			}, req);

			// Now generate tokens and send response
			const tokens = generateAuthTokens(newUser.email, newUser._id.toString(), newUser.role, req);

			const response = { user: { name, email, _id: newUser._id }, tokens };
		
			logger.info('User signup process completed successfully', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				response: response,
				intermediateData: { newUser, newProfile },
			});

			res.status(201).send(response);

		});

	} catch (error) {
		handleError(req, res, error, { name: __filename, type: FILE_TYPES.CONTROLLER });
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