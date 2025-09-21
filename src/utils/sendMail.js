const nodemailer = require('nodemailer');

const {
	MAIL_SENDER_USER, MAIL_SENDER_PASS, MAIL_SENDER_ADDRESS, MAIL_SENDER_NAME, FILE_TYPES
} = require('../config');
const logger = require('../utils/logger');

/**
 * Send an email using nodemailer
 * @param {Object} param0 - The email options
 * @param {string} param0.to - The recipient email address
 * @param {string} param0.subject - The subject of the email
 * @param {string} param0.text - The plain text body of the email
 * @param {string} param0.html - The HTML body of the email
 * @param {import('express').Request} req - The request object for logging context
 * @returns {Promise<boolean>} - Returns true if email sent successfully, otherwise false
 */
const sendEmail = async ({ to, subject, text, html }, req) => {
	try {
		// Create a transporter object using SMTP transport
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: MAIL_SENDER_USER,
				pass: MAIL_SENDER_PASS
			}
		});

		// Define email options
		const mailOptions = {
			from: `"${MAIL_SENDER_NAME}" <${MAIL_SENDER_ADDRESS}>`,
			to,
			subject,
			text,
			html,
		};

		logger.info('Sending an email', {
			req, file: { name: __filename, type: FILE_TYPES.UTIL },
			intermediateData: { to, subject, text, html: html ? '<Provided>' : '<Not Provided>' },
		});

		// Send the email
		const result = await transporter.sendMail(mailOptions);

		logger.info('Sent email successfully', {
			req, file: { name: __filename, type: FILE_TYPES.UTIL },
			intermediateData: { to, subject, result },
		});

		return true;
	} catch (error) {
		logger.error('Caught error', {
			req, file: { name: __filename, type: FILE_TYPES.UTIL },
			intermediateData: { to, subject, text, html: html ? '<Provided>' : '<Not Provided>' },
			error
		});

		return false;
	}
}

module.exports = sendEmail;