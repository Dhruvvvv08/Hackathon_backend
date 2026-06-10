const express = require('express');
const {
  createBooking,
  getUserBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking.
 */
router.post(
  '/',
  authenticate,
  validate([
    {
      field: 'venueId',
      location: 'body',
      type: 'string',
      required: true,
      message: 'venueId is required',
    },
    {
      field: 'date',
      location: 'body',
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'date is required and must be in YYYY-MM-DD format',
    },
    {
      field: 'startTime',
      location: 'body',
      type: 'string',
      required: true,
      pattern: /^\d{2}:00$/,
      message: 'startTime is required and must be in HH:00 format',
    },
  ]),
  createBooking
);

/**
 * DELETE /api/bookings/:id
 * Cancel a booking (owner only).
 */
router.delete('/:id', authenticate, cancelBooking);

module.exports = router;
