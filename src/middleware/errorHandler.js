const buildResponse = require('../utils/response');

/**
 * Global error-handling middleware.
 * Catches all errors thrown in route handlers / other middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(409).json(
      buildResponse(false, 'This slot is already booked. Please choose a different slot.')
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(
      buildResponse(false, messages.join('. '))
    );
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(
      buildResponse(false, `Invalid ${err.path}: ${err.value}`)
    );
  }

  // Custom ApiError
  if (err.name === 'ApiError') {
    return res.status(err.statusCode).json(
      buildResponse(false, err.message)
    );
  }

  // Unexpected errors
  console.error('💥 Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return res.status(statusCode).json(buildResponse(false, message));
};

module.exports = errorHandler;
