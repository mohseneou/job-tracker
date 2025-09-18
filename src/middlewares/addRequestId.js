const crypto = require('crypto');

/**
 * Include a random id in each request so it can be easily distinguished in logging services.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const addRequestId = (req, res, next) => {
	try {
		// Generate 16 random bytes
		const bytes = crypto.randomBytes(8);
		req.requestId = bytes.toString('hex');

		next();
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Something went wrong trying to create request id' });
	}
};

module.exports = addRequestId;