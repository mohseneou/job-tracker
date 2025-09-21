/**
 * 
 * @param {{ [field: string]: { required: boolean, validator: () => boolean } }} fields 
 * @param {any} data 
 * @returns { valid: boolean, message?: string }
 */
const checkForErrors = (fields, data) => {
	for (const [key, value] of Object.entries(fields)) {
		if (value.required && !data[key]) {
			return { valid: false, message: `${key} is required.` };
		}
		if (data[key] && !value.validator(data[key])) {
			return { valid: false, message: `${key} is invalid.` };
		}
	}
	return { valid: true  };
};

module.exports = checkForErrors;