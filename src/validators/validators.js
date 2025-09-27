const mongoose = require('mongoose');

/**
 * Validates if the provided value is a non-empty string.
 * @param {any} value - The value to be checked. 
 * @param {number} [maxLength] - Optional maximum length for the string.
 * @returns {boolean} - Returns true if the value is a non-empty string, otherwise false.
 */
const isString = (value, maxLength) => {
	if (typeof value !== 'string' || value.trim() === '') {
		return false;
	}
	if (maxLength && value.length > maxLength) {
		return false;
	}
	return true;
};

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

/**
 * Validates if the provided value is an array of strings.
 * @param {any} arr - The value to be checked 
 * @returns {boolean} - Returns true if the value is an array of strings, otherwise false.
 */
const isStringArray = (arr) => Array.isArray(arr) && arr.every(isString);

/**
 * Validates if the provided value is a number
 * @param {any} value - The value to be checked 
 * @param {number} min - Define min threshold
 * @param {number} max - Define min threshold
 * @returns {boolean} - Returns true if the provided value is a number between the defined range, false otherwise
 */
const isNumber = (value, min = -Infinity, max = Infinity) => !isNaN(value) && value <= max && value >= min;

/**
 * Validates if the provided value is a valid mongoose object id
 * @param {any} value - The value to be checked 
 * @returns {boolean} - Returns true if the provided value is valid object id, false otherwise
 */
const isObjectId = value => mongoose.Types.ObjectId.isValid(value);

/**
 * Checks if the provided value is a valid sort value (createdAt:+1)
 * @param {any} value - The value to be checked
 * @returns {boolean} - Returns true if value is a valid sort value, false otherwise
 */
const isSort = value => isString(value) && /^[a-zA-Z_]+:((-1)|(1))$/.test(value);

/**
 * Checks if the provided value is a valid select value(_id,name,createdAt)
 * @param {any} value - The value to be checked
 * @returns {boolean} - Returns true if value is a valid select value, false otherwise
 */
const isSelect = value => isString(value) && /^[a-zA-Z_0-9]+(,[a-zA-Z_0-9]+)*$/.test(value);

module.exports = {
	isString,
	isEmail,
	isInEnum,
	isURL,
	isStringArray,
	isNumber,
	isObjectId,
	isSort,
	isSelect,
};