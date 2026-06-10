const ApiError = require('../utils/ApiError');

/**
 * Factory function that returns a validation middleware.
 * Each rule is an object: { field, location, type, required, pattern, message }
 *
 * @param {Array<object>} rules - Validation rules
 * @returns {Function} Express middleware
 */
const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const rule of rules) {
    const source =
      rule.location === 'query' ? req.query :
      rule.location === 'params' ? req.params :
      req.body;

    const value = source[rule.field];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(rule.message || `${rule.field} is required`);
      continue;
    }

    // Skip further checks if value is not present and not required
    if (value === undefined || value === null || value === '') continue;

    // Type check
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${rule.field} must be a string`);
      continue;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || `${rule.field} has an invalid format`);
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join('. '));
  }

  next();
};

module.exports = validate;
