const app = require('./app');
const { PORT } = require('./config');
const logger = require('./utils/logger');

app.listen(PORT, () => {
	logger.info(`Server started on port ${PORT}`);
});