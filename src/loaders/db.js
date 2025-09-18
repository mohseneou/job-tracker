const mongoose = require('mongoose')

const logger = require('../utils/logger');
const { MONGO_CONNECTION_STRING, FILE_TYPES } = require('../config')

const connect = async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING)
    logger.info('Connected to MongoDB successfully', {
			file: { name: __filename, type: FILE_TYPES.LOADER },
		});
  } catch (error) {
		logger.error('Caught error', {
			file: { name: __filename, type: FILE_TYPES.LOADER },
			error
		});
		console.error('Failed to connect to MongoDB', error);
		
    process.exit(1) // Exit process with failure
  }
}

module.exports = connect
