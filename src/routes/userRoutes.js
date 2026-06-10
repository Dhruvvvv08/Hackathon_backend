const express = require('express');
const { getUserBookings } = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * GET /api/users/:id/bookings
 * Get all bookings for a specific user.
 */
router.get('/:id/bookings', authenticate, getUserBookings);

module.exports = router;
