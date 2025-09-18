/**
 * Validates if the provided value is a non-empty string.
 * @param {any} value - The value to be checked. 
 * @returns {boolean} - Returns true if the value is a non-empty string, otherwise false.
 */
const isString = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * Validates if the provided value is in a valid email format.
 * @param {any} value - The value to be checked. 
 * @returns {boolean} - Returns true if the value is a valid email format, otherwise false.
 */
const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

/**
 * Validates if the provided value is one of the allowed enum values.
 * @param {any} value - The value to be check 
 * @param {[any]} enumArray - The array of allowed enum values
 * @returns {boolean} - Returns true if the value is in the enum array, otherwise false.
 */
const isInEnum = (value, enumArray) => enumArray.includes(value);

/**
 * Validates if the provided value is a valid URL.
 * @param {any} value - The value to be checked 
 * @returns {boolean} - Returns true if the value is a valid URL, otherwise false.
 */
const isURL = (value) => {
	try {
		new URL(value);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = {
	isString,
	isEmail,
	isInEnum,
	isURL
};