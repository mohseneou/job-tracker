const app = require('./app');
const { PORT, FILE_TYPES } = require('./config');
const logger = require('./utils/logger');

app.listen(PORT, () => {
	logger.info(`Server started on port ${PORT}`, {
		file: { name: __filename, type: FILE_TYPES.APP },
	});
});