const mongoose = require('mongoose');

const User = require('../../models/user');
const Company = require('../../models/company');

const { FILE_TYPES } = require('../../config');
const { USER_ERRORS, COMPANY_ERRORS } = require('../../config/errorCodes');
const { CustomError, handleError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const sendEmail = require('../../utils/sendMail');

/**
 * Generate job poster account request
 * @param {import('../../models/user').schema} user - User object who requested the account
 * @param {import('../../models/user').schema} admin - The company object 
 * @param {import('express').Request} req - Express request object (for logging)
 * @returns {{ text: string, html: string }} - Email body content
 */
const generateRejectionEmail = (user, admin, note, req = {}) => {
	logger.verbose('Generating rejection email content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { admin, user },
	});

	const textContent = `Hello ${user.name},
Your job poster account request has been rejected by ${admin.name}.
You can find more about why this happened below. You can edit and re-submit your request now.
${note} `;

	const htmlContent = `<p>Hello ${user.name},</p>
<p>Your job poster account request has been rejected by ${admin.name}.</p>
<p>You can find more about why this happened below. You can edit and re-submit your request now.</p>
<p>${note}.</p>`;

	logger.verbose('Generated rejection email content', {
		req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
		intermediateData: { textContent },
	});

	return { text: textContent, html: htmlContent };
};

/**
 * Reject a company account request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express request object
 */
const rejectAccount = async (req, res) => {
	// Define mongoose session outside catch block
	let session;

	try {
		logger.info('Start rejecting company account request', {
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
		const company = await Company.findById(companyId);
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

		// Find user on database
		const user = await User.findById(company.user).lean();

		// Start a mongoose session
		session = await mongoose.startSession();

		// Update company object and send an email to user in a session
		await session.withTransaction(async () => {

			// Update company status to rejecetd and insert admin notes
			company.status = 'rejected';
			company.adminNotes = {
				admin: admin._id,
				updatedAt: Date.now(),
				note
			};

			await company.save({ session });

			// Send an email to the user requesting job poster account
			const emailContent = generateRejectionEmail(user, admin, note, req);

			await sendEmail({
				to: user.email,
				subject: 'Job poster account request rejected',
				html: emailContent.html,
				text: emailContent.text
			}, req);

			const response = { message: 'Rejected company request successfully' };

			logger.info('Rejected company request successfully', {
				req, file: { name: __filename, type: FILE_TYPES.CONTROLLER },
				intermediateData: { user, admin, company },
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

module.exports = rejectAccount;