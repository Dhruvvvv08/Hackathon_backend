/**
 * Build a consistent JSON response object.
 *
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} message - Human-readable message
 * @param {*} [data=null] - Response payload
 * @returns {{ success: boolean, message: string, data: * }}
 */
const buildResponse = (success, message, data = null) => ({
  success,
  message,
  data,
});

module.exports = buildResponse;
