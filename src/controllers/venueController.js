const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const buildResponse = require('../utils/response');
const ApiError = require('../utils/ApiError');

/**
 * Generate all hourly slot labels from 6:00 AM to 10:00 PM.
 * Returns an array of { startTime, endTime } objects.
 */
const generateSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 22; hour++) {
    const start = `${String(hour).padStart(2, '0')}:00`;
    const end = `${String(hour + 1).padStart(2, '0')}:00`;
    slots.push({ startTime: start, endTime: end });
  }
  return slots;
};

/**
 * @route   GET /api/venues
 * @desc    Get all venues
 * @access  Public
 */
const getAllVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find().sort({ name: 1 }).lean();

  res.status(200).json(
    buildResponse(true, 'Venues retrieved successfully', venues)
  );
});

/**
 * @route   GET /api/venues/:id/slots?date=YYYY-MM-DD
 * @desc    Get all hourly slots (6 AM – 10 PM) with availability status
 * @access  Public
 */
const getVenueSlots = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  // Verify venue exists
  const venue = await Venue.findById(id).lean();
  if (!venue) {
    throw new ApiError(404, 'Venue not found');
  }

  // Get all active bookings for this venue on the given date
  const bookings = await Booking.find({
    venueId: id,
    date,
    status: 'booked',
  })
    .select('startTime endTime userId')
    .lean();

  // Build a Set of booked start times for O(1) lookup
  const bookedTimes = new Set(bookings.map((b) => b.startTime));

  // Generate slot list with availability
  const allSlots = generateSlots();
  const slots = allSlots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: bookedTimes.has(slot.startTime) ? 'booked' : 'available',
  }));

  res.status(200).json(
    buildResponse(true, 'Slots retrieved successfully', {
      venue,
      date,
      slots,
    })
  );
});

module.exports = {
  getAllVenues,
  getVenueSlots,
};
