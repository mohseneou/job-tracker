const morgan = require('morgan');
const logger = require('../utils/logger');

// Where to write logs
const stream = {
	write: message => logger.http(message)
};

// Create morgan instance
const morganMiddleware = morgan(
	`:remote-addr :method :url :status :res[content-length] ':user-agent' - :response-time ms`,
	{ stream }
);

module.exports = morganMiddleware;