const Transport = require('winston-transport');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const {
	LoggerProvider,
	SimpleLogRecordProcessor
} = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

const SEVERITY_NUMBERS = {
	DEBUG: 3,
	VERBOSE: 6,
	HTTP: 8,
	INFO: 10,
	WARN: 15,
	ERROR: 20
};

/**
 * Flattens an object, making it have a single level of deepness
 * @param {Object} ob - The object you want to flatten
 * @returns {Object} - The object flattened. Nested attributes are concatinated by period.
 */
const flattenObject = ob => {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

class OTLPTransport extends Transport {
  constructor(opts) {
    super(opts);

		// Set resource details
		this.resource = resourceFromAttributes({
			'service.name': opts.serviceName,
			'host.name': opts.hostName,
			'deployment.environment': opts.deploymentEnvironment
		});

    // exporter options. see all options in OTLPExporterNodeConfigBase
		// header is defined in the following object
		this.collectorOptions = {
			url: opts.url,
		};

		this.logExporter = new OTLPLogExporter(this.collectorOptions);
		this.loggerProvider = new LoggerProvider({ resource: this.resource, processors: [new SimpleLogRecordProcessor(this.logExporter)] });

		this.logger = this.loggerProvider.getLogger('default', '1.0.0');
  }

  log(info, callback) {
    try {
			setImmediate(() => this.emit('logged', info));

			const { level, message, ...attributes } = info;

			this.logger.emit({
				severityText: level.toUpperCase(),
				severityNumber: SEVERITY_NUMBERS[level.toUpperCase()],
				body: message,
				attributes: flattenObject(JSON.parse(JSON.stringify(attributes)))
			});

			callback();
		} catch (error) {
			console.error(error);
		}
  }
}

module.exports = OTLPTransport;
