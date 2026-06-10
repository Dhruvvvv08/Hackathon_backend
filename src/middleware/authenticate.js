const users = require('../config/users');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to authenticate the current user via the X-User-Id header.
 * Looks up the user in the hardcoded users array and attaches it to req.user.
 */
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    throw new ApiError(401, 'Missing X-User-Id header');
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw new ApiError(401, `User not found for id: ${userId}`);
  }

  // Attach the full user object to the request
  req.user = user;
  next();
};

module.exports = authenticate;
