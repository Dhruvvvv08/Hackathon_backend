const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');
const buildResponse = require('../utils/response');
const ApiError = require('../utils/ApiError');
const users = require('../config/users');
const { sendBookingConfirmation, sendCancellationEmail } = require('../utils/email');

/**
 * Valid hourly start times (06:00 – 21:00).
 */
const VALID_START_TIMES = new Set(
  Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`)
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (concurrency-safe via unique compound index)
 * @access  Authenticated
 */
const createBooking = asyncHandler(async (req, res) => {
  const { venueId, date, startTime } = req.body;

  // Validate startTime is within allowed range
  if (!VALID_START_TIMES.has(startTime)) {
    throw new ApiError(400, 'startTime must be an hourly slot between 06:00 and 21:00');
  }

  // Verify venue exists
  const venue = await Venue.findById(venueId).lean();
  if (!venue) {
    throw new ApiError(404, 'Venue not found');
  }

  // Calculate endTime (startTime + 1 hour)
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;

  // Attempt to create the booking.
  // If a duplicate active booking exists, MongoDB will throw E11000
  // which the errorHandler middleware translates to a 409 response.
  const booking = await Booking.create({
    userId: req.user.id,
    venueId,
    date,
    startTime,
    endTime,
    status: 'booked',
  });

  // Send confirmation email (non-blocking)
  sendBookingConfirmation({
    to: req.user.email,
    userName: req.user.name,
    venueName: venue.name,
    sport: venue.sport,
    date,
    startTime,
    endTime,
  });

  res.status(201).json(
    buildResponse(true, 'Booking created successfully', booking)
  );
});

/**
 * @route   GET /api/users/:id/bookings
 * @desc    Get all bookings for a user
 * @access  Authenticated
 */
const getUserBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify the user exists in the hardcoded list
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const bookings = await Booking.find({ userId: id })
    .populate('venueId', 'name sport')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    buildResponse(true, 'User bookings retrieved successfully', bookings)
  );
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel a booking (only the owner can cancel)
 * @access  Authenticated
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Only the booking owner can cancel
  if (booking.userId !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'Booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  // Fetch venue for email
  const venue = await Venue.findById(booking.venueId).lean();

  // Send cancellation email (non-blocking)
  sendCancellationEmail({
    to: req.user.email,
    userName: req.user.name,
    venueName: venue ? venue.name : 'Unknown Venue',
    sport: venue ? venue.sport : '',
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  res.status(200).json(
    buildResponse(true, 'Booking cancelled successfully', booking)
  );
});

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
};
