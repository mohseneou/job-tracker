const { createLogger, format } = require('winston');
const path = require('path');
const {
	LOGGER_DEPLOYMENT_ENVIRONMENT,
	LOGGER_HOST_NAME,
	LOGGER_SERVICE_NAME,
	LOGGER_URL
} = require('../../config');
const OTLPTransport = require('./otelTransport');

/**
 * Serialize errors passed down to winston
 */
const errorSerializer = format((info) => {
  if (info.error && info.error instanceof Error) {
    info.error = {
      name: info.error?.name,
      message: info.error?.message,
      stack: info.error?.stack,
    };
  }

  return info;
});

/**
 * Log input data
 */
const inputFormatter = format((info) => {
	const { req = {}, ...attributes } = info;

	return {
		...attributes, req,
		input: {
			...attributes.input,
			body: req?.body,
			params: req?.params,
			query: req?.query
		}
	};
});

/**
 * Derive fields related to user's request
 */
const requestFormatter = format(info => {
	const { req = {}, ...attributes } = info;

	return {
		...attributes,
		request: {
			id: req?.requestId,
			path: req.path,
			method: req?.method,
			userAgent: req?.headers?.['user-agent'],
			platform: req?.headers?.platform,
			ip: req?.ip,
			originalUrl: req.originalUrl,
			user: req.user
		}
	};
});

/**
 * Format file name as some logging services do filter values including slashes
 */
const fileFormatter = format(info => {
	const { file, ...attributes } = info;

	return {
		...attributes,
		file: file ? {
			...file,
			name: path.basename(file.name)
		} : {}
	};
});

const logger = createLogger({
  level: 'debug',
  exitOnError: false,
  format: format.combine(
		errorSerializer(),
		inputFormatter(),
		requestFormatter(),
		fileFormatter(),
		format.json()
	),
  transports: [
		new OTLPTransport({
			serviceName: LOGGER_SERVICE_NAME,
			deploymentEnvironment: LOGGER_DEPLOYMENT_ENVIRONMENT,
			hostName: LOGGER_HOST_NAME,
			url: LOGGER_URL,
		})
  ]
})

module.exports = logger
