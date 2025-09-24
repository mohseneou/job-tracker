const mongoose = require('mongoose');

const User = require('../../models/user');
const Company = require('../../models/company');

const { FILE_TYPES } = require('../../config');
const { USER_ERRORS, COMPANY_ERRORS } = require('../../config/errorCodes');
const { CustomError, handleError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const sendEmail = require('../../utils/sendMail');

/**
 * Generate job poster account request approval email
 * @param {import('../../models/user').schema} user - User object who requested the account
 * @param {import('../../models/user').schema} admin - The company object 
 * @param {import('express').Request} req - Express request object (for logging)
 * @returns {{ text: string, html: string }} - Email body content
 */
const generateRejectionEmail = (user, admin, note, req = {}) => {
	logger.verbose('Generating company account approval email content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { admin, user },
	});

	const textContent = `Hello ${user.name},
Your job poster account request has been approved by ${admin.name}.
Here is some notes our admins have submitted reviewing your request.
${note}
You can now re-login to your account to post jobs and review submissions.`;

	const htmlContent = `<p>Hello ${user.name},</p>
<p>Your job poster account request has been approved by ${admin.name}.</p>
<p>Here is some notes our admins have submitted reviewing your request.</p>
<p>${note}.</p>
<p>You can now re-login to your account to post jobs and review submissions.</p>`;

	logger.verbose('Generated company account approval email content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { textContent },
	});

	return { text: textContent, html: htmlContent };
};

/**
 * Approve a company account request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express request object
 */
const acceptAccount = async (req, res) => {
	// Define mongoose session outside catch block
	let session;

	try {
		logger.info('Start approving company account request', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		});

		// Check if admin exists
		const admin = await User.findById(req.user._id).lean();
		if (!admin) {
			throw CustomError('Admin not found', USER_ERRORS.ADMIN_NOT_FOUND, 404);
		}

		logger.verbose('Found admin on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { admin },
		});

		const { note, company: companyId } = req.body;

		// Now check if the company exists
		const company = await Company.findById(companyId).populate('user');
		if (!company) {
			throw CustomError('Company not found', COMPANY_ERRORS.COMPANY_NOT_FOUND, 404);
		}

		logger.verbose('Found company on database', {
			req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
			intermediateData: { admin, company },
		});

		// Check if company is in pending state
		if (company.status !== 'pending') {
			throw CustomError('Company is not in pending state', COMPANY_ERRORS.COMPANY_IS_NOT_PENDING, 400, undefined, { intermediateData: { company } });
		}

		// Start a mongoose session
		session = await mongoose.startSession();

		// Update company object and send an email to user in a session
		await session.withTransaction(async () => {

			// Update company status to approved and insert admin notes
			company.status = 'approved';
			company.adminNotes = {
				admin: admin._id,
				updatedAt: Date.now(),
				note
			};

			await company.save({ session });

			// Update user role to job-poster
			await User.updateOne({ _id: company.user._id }, { role: 'job-poster' }, { session });

			// Send an email to the user requesting job poster account
			const emailContent = generateRejectionEmail(company.user, admin, note, req);

			await sendEmail({
				to: company.user.email,
				subject: 'Job poster account request approved',
				html: emailContent.html,
				text: emailContent.text
			}, req);

			const response = { message: 'Approved company request successfully' };

			logger.info('Approved company request successfully', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { user: company.user, admin, company },
				output: response,
			});

			res.send(response);
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

module.exports = acceptAccount;