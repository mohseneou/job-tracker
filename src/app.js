const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const logger = require('./utils/logger');
const { FILE_TYPES } = require('./config');

// Loaders
const connectDB = require('./loaders/db');

connectDB();

// Import routes
const routes = require('./routes');

// Import middlewares
const morganMiddleware = require('./middlewares/morgan');
const addRequestId = require('./middlewares/addRequestId');

// Create an express app
const app = express();

// Configure express app
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(addRequestId);
app.use(morganMiddleware);

// Inject routes
app.use('/api', routes);

// Handle errors
app.use((err, req, res, next) => {
	const response = { message: 'Something went wrong on server' };

	logger.error('Caught error', {
		req, file: { name: __filename, type: FILE_TYPES.APP },
		output: response,
		error: err
	});

	res.status(500).json(response);
});

module.exports = app;